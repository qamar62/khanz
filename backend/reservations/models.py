import hashlib
import uuid
from datetime import datetime, timedelta
from decimal import Decimal
from pathlib import Path

import pytz
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.text import slugify
from django.utils import timezone


def generate_reservation_reference():
    return f"KH{uuid.uuid4().hex[:10].upper()}"


def default_payment_methods():
    # Kept only because migration 0008 references it; branches no longer choose payment methods.
    return ['card']


def active_bookings(queryset):
    """Bookings that currently consume slot capacity.

    Cancelled/no-show bookings never count. Card bookings that were never paid
    stop holding seats once the payment hold window has passed.
    """
    from django.conf import settings

    hold_cutoff = timezone.now() - timedelta(minutes=getattr(settings, 'PAYMENT_HOLD_MINUTES', 30))
    return (
        queryset.exclude(status__in=['cancelled', 'no_show'])
        .exclude(status='payment_pending', created_at__lt=hold_cutoff)
    )


class Reservation(models.Model):
    """Table reservation model"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('payment_pending', 'Payment Pending'),
        ('confirmed', 'Confirmed'),
        ('waiting', 'Waiting in Bar'),
        ('table_ready', 'Table Ready'),
        ('seated', 'Seated'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
        ('completed', 'Completed'),
    ]

    SOURCE_CHOICES = [
        ('web', 'Website'),
        ('mobile', 'Mobile App'),
        ('admin', 'Dashboard'),
        ('phone', 'Phone'),
        ('walk_in', 'Walk-in'),
        ('partner', 'Partner Channel'),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('not_required', 'Not Required'),
        ('unpaid', 'Unpaid'),
        ('processing', 'Processing'),
        ('paid', 'Paid'),
        ('partially_refunded', 'Partially Refunded'),
        ('refunded', 'Refunded'),
        ('failed', 'Failed'),
    ]

    PAYMENT_METHOD_CHOICES = [
        ('card', 'Card (online deposit)'),
    ]
    
    OCCASION_CHOICES = [
        ('none', 'None'),
        ('birthday', 'Birthday'),
        ('anniversary', 'Anniversary'),
        ('date', 'Date Night'),
        ('business', 'Business Dinner'),
        ('celebration', 'Celebration'),
        ('other', 'Other'),
    ]
    
    # Guest Information
    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    
    # Reservation Details
    # Kept for backwards compatibility while clients migrate to branch_slug.
    branch = models.CharField(max_length=100, blank=True, default='')
    branch_location = models.ForeignKey(
        'Branch',
        on_delete=models.PROTECT,
        related_name='reservations',
        null=True,
        blank=True,
    )
    reference = models.CharField(
        max_length=16,
        unique=True,
        editable=False,
        db_index=True,
        default=generate_reservation_reference,
    )
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='web')
    external_reference = models.CharField(max_length=120, blank=True, db_index=True)
    date = models.DateField()
    time = models.TimeField()
    duration_minutes = models.PositiveSmallIntegerField(default=90)
    time_slot = models.ForeignKey(
        'BranchTimeSlot',
        on_delete=models.PROTECT,
        related_name='reservations',
        null=True,
        blank=True,
    )
    adult_guests = models.PositiveSmallIntegerField(default=0)
    child_guests = models.PositiveSmallIntegerField(default=0)
    guests = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(20)]
    )
    occasion = models.CharField(
        max_length=20,
        choices=OCCASION_CHOICES,
        default='none',
        blank=True
    )
    special_requests = models.TextField(blank=True)
    internal_notes = models.TextField(blank=True)
    
    # Status and Tracking
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    google_calendar_event_id = models.CharField(max_length=255, blank=True)
    confirmation_attempts = models.PositiveSmallIntegerField(default=0)
    arrival_time = models.DateTimeField(null=True, blank=True)
    seated_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    deposit_required = models.BooleanField(default=False)
    deposit_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    payment_status = models.CharField(
        max_length=24,
        choices=PAYMENT_STATUS_CHOICES,
        default='not_required',
    )
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        default='card',
    )
    tables = models.ManyToManyField('RestaurantTable', related_name='reservations', blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date', '-time']
        verbose_name = 'Reservation'
        verbose_name_plural = 'Reservations'
    
    def __str__(self):
        return f"{self.reference} - {self.name} - {self.date} at {self.time}"

    def save(self, *args, **kwargs):
        if not self.reference:
            self.reference = generate_reservation_reference()
        if self.branch_location:
            self.branch = self.branch_location.slug or self.branch_location.name
            if not self.duration_minutes:
                self.duration_minutes = self.branch_location.default_booking_duration_minutes
        if self.time_slot:
            self.branch_location = self.time_slot.branch
            self.time = self.time_slot.start_time
        if self.adult_guests or self.child_guests:
            self.guests = self.adult_guests + self.child_guests
        super().save(*args, **kwargs)
    
    @property
    def is_upcoming(self):
        """Check if reservation is in the future"""
        from datetime import datetime
        import pytz
        
        # Make reservation datetime timezone-aware
        reservation_datetime = datetime.combine(self.date, self.time)
        nz_tz = pytz.timezone('Pacific/Auckland')
        reservation_datetime = nz_tz.localize(reservation_datetime)
        
        return reservation_datetime > timezone.now()

    @property
    def ends_at(self):
        reservation_datetime = datetime.combine(self.date, self.time)
        nz_tz = pytz.timezone(
            self.branch_location.timezone if self.branch_location else 'Pacific/Auckland'
        )
        return nz_tz.localize(reservation_datetime) + timedelta(minutes=self.duration_minutes)


class ContactMessage(models.Model):
    """Contact form submissions"""
    
    STATUS_CHOICES = [
        ('new', 'New'),
        ('read', 'Read'),
        ('replied', 'Replied'),
        ('archived', 'Archived'),
    ]
    
    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    message = models.TextField()
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='new'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Contact Message'
        verbose_name_plural = 'Contact Messages'
    
    def __str__(self):
        return f"{self.name} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"


class CateringRequest(models.Model):
    """Catering service requests"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('contacted', 'Contacted'),
        ('quoted', 'Quoted'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]
    
    EVENT_TYPE_CHOICES = [
        ('wedding', 'Wedding'),
        ('corporate', 'Corporate Event'),
        ('private', 'Private Party'),
        ('other', 'Other'),
    ]
    
    # Contact Information
    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    
    # Event Details
    event_type = models.CharField(max_length=20, choices=EVENT_TYPE_CHOICES)
    event_date = models.DateField()
    guest_count = models.IntegerField(
        validators=[MinValueValidator(10), MaxValueValidator(1000)]
    )
    venue_address = models.TextField(blank=True)
    message = models.TextField(blank=True)
    
    # Status and Tracking
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    estimated_budget = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )
    notes = models.TextField(blank=True, help_text="Internal notes")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Catering Request'
        verbose_name_plural = 'Catering Requests'
    
    def __str__(self):
        return f"{self.name} - {self.event_type} on {self.event_date}"


class Branch(models.Model):
    """Restaurant branch locations"""
    
    DEPOSIT_POLICY_CHOICES = [
        ('none', 'No Deposit'),
        ('fixed', 'Fixed Per Booking'),
        ('per_guest', 'Per Guest'),
    ]

    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=120, unique=True, null=True, blank=True)
    code = models.CharField(max_length=20, unique=True, null=True, blank=True)
    address = models.TextField()
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    hours = models.CharField(max_length=200)
    is_flagship = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    booking_enabled = models.BooleanField(default=True)
    timezone = models.CharField(max_length=64, default='Pacific/Auckland')
    currency = models.CharField(max_length=3, default='NZD')
    booking_interval_minutes = models.PositiveSmallIntegerField(default=30)
    default_booking_duration_minutes = models.PositiveSmallIntegerField(default=90)
    min_advance_minutes = models.PositiveIntegerField(default=120)
    max_advance_days = models.PositiveSmallIntegerField(default=30)
    max_online_party_size = models.PositiveSmallIntegerField(default=12)
    online_capacity = models.PositiveSmallIntegerField(default=60)
    deposit_policy = models.CharField(
        max_length=20, choices=DEPOSIT_POLICY_CHOICES, default='none',
        help_text='Card deposit taken online via Stripe when booking. "No Deposit" = booking needs no payment.',
    )
    deposit_amount = models.DecimalField(
        max_digits=10, decimal_places=2, default=Decimal('0.00'),
        help_text='Amount per booking (Fixed) or per guest (Per Guest), in the branch currency.',
    )
    stripe_account_id = models.CharField(max_length=255, blank=True)
    pickup_enabled = models.BooleanField(default=True, help_text='Accept online pickup orders for this branch.')
    pickup_prep_minutes = models.PositiveSmallIntegerField(
        default=25, help_text='Typical minutes until an ASAP pickup order is ready.',
    )
    sort_order = models.PositiveSmallIntegerField(default=0)
    
    # Additional Info
    google_maps_url = models.URLField(blank=True)
    description = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['sort_order', '-is_flagship', 'name']
        verbose_name = 'Branch'
        verbose_name_plural = 'Branches'
    
    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.name)[:100] or uuid.uuid4().hex[:8]
            candidate = base
            suffix = 2
            while Branch.objects.exclude(pk=self.pk).filter(slug=candidate).exists():
                candidate = f"{base}-{suffix}"
                suffix += 1
            self.slug = candidate
        if not self.code:
            self.code = (self.slug or uuid.uuid4().hex[:8]).replace('-', '_').upper()[:20]
        super().save(*args, **kwargs)


class BranchTimeSlot(models.Model):
    """Recurring branch-owned booking capacity for a weekday and start time."""

    DAY_CHOICES = [
        (0, 'Monday'), (1, 'Tuesday'), (2, 'Wednesday'), (3, 'Thursday'),
        (4, 'Friday'), (5, 'Saturday'), (6, 'Sunday'),
    ]

    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='time_slots')
    day_of_week = models.PositiveSmallIntegerField(choices=DAY_CHOICES)
    start_time = models.TimeField()
    capacity = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1)],
        help_text='Maximum people for this slot. Adults and children both count.',
    )
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['branch', 'day_of_week', 'sort_order', 'start_time']
        constraints = [
            models.UniqueConstraint(
                fields=['branch', 'day_of_week', 'start_time'],
                name='unique_branch_weekday_start_time',
            ),
        ]

    def __str__(self):
        return f'{self.branch.name} - {self.get_day_of_week_display()} {self.start_time:%I:%M %p}'


class RestaurantTable(models.Model):
    """A physical table that can be allocated to one or more reservations."""

    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='tables')
    name = models.CharField(max_length=60)
    area = models.CharField(max_length=80, blank=True)
    min_capacity = models.PositiveSmallIntegerField(default=1)
    max_capacity = models.PositiveSmallIntegerField(default=2)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['branch', 'sort_order', 'name']
        constraints = [
            models.UniqueConstraint(fields=['branch', 'name'], name='unique_table_name_per_branch'),
        ]

    def __str__(self):
        return f"{self.branch.code or self.branch.name} - {self.name}"


def menu_upload_path(instance, filename):
    branch = instance.branch.slug if instance.branch else 'group'
    version = slugify(instance.version) or 'current'
    return f"menus/{branch}/{version}/{filename}"


class MenuDocument(models.Model):
    """Versioned menu PDF. The file lives in storage; searchable metadata lives in the DB."""

    title = models.CharField(max_length=200)
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name='menus',
        null=True,
        blank=True,
        help_text='Leave blank for a group-wide menu.',
    )
    version = models.CharField(max_length=80)
    file = models.FileField(upload_to=menu_upload_path)
    original_filename = models.CharField(max_length=255, blank=True)
    file_size = models.PositiveBigIntegerField(default=0)
    checksum_sha256 = models.CharField(max_length=64, blank=True, db_index=True)
    page_count = models.PositiveSmallIntegerField(null=True, blank=True)
    effective_from = models.DateField(default=timezone.localdate)
    expires_on = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_public = models.BooleanField(default=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-effective_from', '-uploaded_at']
        constraints = [
            models.UniqueConstraint(fields=['branch', 'version'], name='unique_menu_version_per_branch'),
        ]

    def __str__(self):
        scope = self.branch.name if self.branch else 'Khanz Group'
        return f"{scope} - {self.title} ({self.version})"

    def save(self, *args, **kwargs):
        if self.file:
            self.original_filename = self.original_filename or Path(self.file.name).name
            self.file_size = self.file.size
            if not self.checksum_sha256:
                digest = hashlib.sha256()
                for chunk in self.file.chunks():
                    digest.update(chunk)
                self.checksum_sha256 = digest.hexdigest()
                self.file.seek(0)
        super().save(*args, **kwargs)


class MenuCategory(models.Model):
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=120, unique=True)
    description = models.TextField(blank=True)
    display_order = models.PositiveSmallIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    suggest_at_checkout = models.BooleanField(
        default=False,
        help_text='Suggest items from this category in the cart as add-ons (e.g. breads, drinks).',
    )

    class Meta:
        ordering = ['display_order', 'name']
        verbose_name_plural = 'Menu categories'

    def __str__(self):
        return self.name


class MenuItem(models.Model):
    category = models.ForeignKey(MenuCategory, on_delete=models.PROTECT, related_name='items')
    branches = models.ManyToManyField(
        Branch,
        related_name='menu_items',
        blank=True,
        help_text='Leave empty to make this item available at every branch.',
    )
    code = models.CharField(max_length=20, unique=True, db_index=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    dietary_labels = models.JSONField(default=list, blank=True)
    spice_level = models.PositiveSmallIntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(3)],
    )
    is_popular = models.BooleanField(default=False)
    is_chef_special = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    display_order = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['category__display_order', 'display_order', 'code']

    def __str__(self):
        return f'{self.code} - {self.name}'


class MenuItemOption(models.Model):
    item = models.ForeignKey(MenuItem, on_delete=models.CASCADE, related_name='options')
    name = models.CharField(max_length=120)
    additional_price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    is_active = models.BooleanField(default=True)
    display_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['display_order', 'name']

    def __str__(self):
        return f'{self.item.code} - {self.name}'


class Payment(models.Model):
    PROVIDER_CHOICES = [('stripe', 'Stripe')]
    TYPE_CHOICES = [('deposit', 'Deposit'), ('balance', 'Balance'), ('refund', 'Refund')]
    STATUS_CHOICES = [
        ('requires_payment', 'Requires Payment'),
        ('processing', 'Processing'),
        ('succeeded', 'Succeeded'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
        ('partially_refunded', 'Partially Refunded'),
        ('refunded', 'Refunded'),
    ]

    reservation = models.ForeignKey(Reservation, on_delete=models.CASCADE, related_name='payments')
    provider = models.CharField(max_length=20, choices=PROVIDER_CHOICES, default='stripe')
    payment_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='deposit')
    status = models.CharField(max_length=24, choices=STATUS_CHOICES, default='requires_payment')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='NZD')
    external_payment_intent_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    external_checkout_session_id = models.CharField(max_length=255, null=True, blank=True)
    idempotency_key = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    failure_message = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.reservation.reference} - {self.amount} {self.currency} - {self.status}"


class ReservationEvent(models.Model):
    """Append-only operational history for dashboard and support workflows."""

    reservation = models.ForeignKey(Reservation, on_delete=models.CASCADE, related_name='events')
    event_type = models.CharField(max_length=60)
    from_status = models.CharField(max_length=24, blank=True)
    to_status = models.CharField(max_length=24, blank=True)
    note = models.TextField(blank=True)
    actor = models.CharField(max_length=150, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.reservation.reference} - {self.event_type}"
