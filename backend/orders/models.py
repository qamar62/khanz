import hashlib
import hmac
import uuid
from decimal import ROUND_HALF_UP, Decimal

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone


def generate_order_reference():
    return f"KO{uuid.uuid4().hex[:8].upper()}"


def hash_otp(email, code):
    raw = f'{email.strip().lower()}:{code}'.encode()
    return hmac.new(settings.SECRET_KEY.encode(), raw, hashlib.sha256).hexdigest()


class PromotionQuerySet(models.QuerySet):
    def live(self, now=None):
        now = now or timezone.now()
        return self.filter(is_active=True, starts_at__lte=now, ends_at__gt=now)


class Promotion(models.Model):
    """A time-boxed promotion. While live it is shown on the site and its discount is applied automatically."""

    DISCOUNT_CHOICES = [
        ('percent', 'Percentage off'),
        ('fixed', 'Fixed amount off'),
        ('none', 'No discount (announcement only)'),
    ]
    APPLIES_CHOICES = [
        ('all', 'Pickup orders and reservation pre-orders'),
        ('pickup', 'Pickup orders only'),
        ('preorder', 'Reservation pre-orders only'),
    ]

    title = models.CharField(max_length=120, help_text='e.g. "Weekend feast: 15% off pickup"')
    description = models.CharField(max_length=300, blank=True, help_text='One or two short sentences shown under the title.')
    badge = models.CharField(max_length=30, blank=True, help_text='Short label, e.g. "15% OFF". Generated if left blank.')
    image = models.ImageField(upload_to='promotions/', blank=True, help_text='Optional background photo for the home page banner.')
    discount_type = models.CharField(max_length=10, choices=DISCOUNT_CHOICES, default='percent')
    discount_value = models.DecimalField(
        max_digits=8, decimal_places=2, default=Decimal('0.00'),
        help_text='Percent (e.g. 15) or dollar amount (e.g. 10.00).',
    )
    min_subtotal = models.DecimalField(
        max_digits=8, decimal_places=2, default=Decimal('0.00'),
        help_text='Minimum food subtotal for the discount to apply (0 = no minimum).',
    )
    applies_to = models.CharField(max_length=10, choices=APPLIES_CHOICES, default='all')
    starts_at = models.DateTimeField(help_text='When the promotion goes live (restaurant time).')
    ends_at = models.DateTimeField(help_text='When it expires (restaurant time).')
    is_active = models.BooleanField(default=True, help_text='Untick to pause it without changing dates.')
    show_on_home = models.BooleanField(default=True)
    show_on_checkout = models.BooleanField(default=True)
    cta_label = models.CharField(max_length=40, default='Order now')
    cta_url = models.CharField(max_length=200, default='/menu')
    priority = models.PositiveSmallIntegerField(default=0, help_text='Higher shows first when several are live.')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = PromotionQuerySet.as_manager()

    class Meta:
        ordering = ['-priority', 'ends_at']

    def __str__(self):
        return self.title

    def clean(self):
        if self.starts_at and self.ends_at and self.ends_at <= self.starts_at:
            raise ValidationError({'ends_at': 'The end must be after the start.'})
        if self.discount_type == 'percent' and not (0 < self.discount_value <= 100):
            raise ValidationError({'discount_value': 'Enter a percentage between 0 and 100.'})
        if self.discount_type == 'fixed' and self.discount_value <= 0:
            raise ValidationError({'discount_value': 'Enter an amount greater than 0.'})

    @property
    def is_live(self):
        now = timezone.now()
        return self.is_active and self.starts_at <= now < self.ends_at

    @property
    def display_badge(self):
        if self.badge:
            return self.badge
        if self.discount_type == 'percent':
            return f'{self.discount_value.normalize():f}% OFF'
        if self.discount_type == 'fixed':
            return f'${self.discount_value.normalize():f} OFF'
        return ''

    def applies(self, kind):
        return self.applies_to in ('all', kind)

    def discount_for(self, subtotal):
        if self.discount_type == 'none' or subtotal <= 0 or subtotal < self.min_subtotal:
            return Decimal('0.00')
        if self.discount_type == 'percent':
            amount = subtotal * self.discount_value / Decimal('100')
        else:
            amount = self.discount_value
        return min(amount, subtotal).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)


class Customer(models.Model):
    """A customer identified only by a verified email address (no password)."""

    email = models.EmailField(unique=True)
    name = models.CharField(max_length=200, blank=True)
    phone = models.CharField(max_length=30, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_login_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.email


class EmailOTP(models.Model):
    email = models.EmailField(db_index=True)
    code_hash = models.CharField(max_length=64)
    expires_at = models.DateTimeField()
    attempts = models.PositiveSmallIntegerField(default=0)
    used_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Email sign-in code'

    def matches(self, code):
        return hmac.compare_digest(self.code_hash, hash_otp(self.email, code))


class Order(models.Model):
    KIND_CHOICES = [
        ('pickup', 'Pickup order'),
        ('preorder', 'Reservation pre-order'),
    ]
    STATUS_CHOICES = [
        ('awaiting_payment', 'Awaiting payment'),
        ('confirmed', 'Confirmed'),
        ('preparing', 'Preparing'),
        ('ready', 'Ready for pickup'),
        ('collected', 'Collected'),
        ('cancelled', 'Cancelled'),
    ]
    PAYMENT_STATUS_CHOICES = [
        ('unpaid', 'Unpaid'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    ]

    reference = models.CharField(max_length=16, unique=True, default=generate_order_reference, editable=False)
    kind = models.CharField(max_length=10, choices=KIND_CHOICES, default='pickup')
    customer = models.ForeignKey(Customer, null=True, blank=True, on_delete=models.SET_NULL, related_name='orders')
    branch = models.ForeignKey('reservations.Branch', on_delete=models.PROTECT, related_name='orders')
    reservation = models.OneToOneField(
        'reservations.Reservation', null=True, blank=True, on_delete=models.CASCADE, related_name='preorder',
    )
    name = models.CharField(max_length=200)
    email = models.EmailField(blank=True, help_text='Optional for guest orders.')
    phone = models.CharField(max_length=30)
    is_guest = models.BooleanField(default=False, help_text='Placed without verifying an email address.')
    pickup_asap = models.BooleanField(default=False)
    pickup_at = models.DateTimeField(null=True, blank=True, help_text='Requested pickup time (or table time for pre-orders).')
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='awaiting_payment')
    payment_status = models.CharField(max_length=12, choices=PAYMENT_STATUS_CHOICES, default='unpaid')
    currency = models.CharField(max_length=3, default='NZD')
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    promotion = models.ForeignKey('Promotion', null=True, blank=True, on_delete=models.SET_NULL, related_name='orders')
    promotion_title = models.CharField(max_length=120, blank=True)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    card_fee_percent = models.DecimalField(max_digits=4, decimal_places=2, default=Decimal('0.00'))
    card_fee = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    total = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    stripe_checkout_session_id = models.CharField(max_length=255, blank=True)
    stripe_payment_intent_id = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.reference} - {self.name} - {self.total} {self.currency}'


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    menu_item = models.ForeignKey('reservations.MenuItem', null=True, blank=True, on_delete=models.SET_NULL)
    code = models.CharField(max_length=20, blank=True)
    name = models.CharField(max_length=200)
    options = models.JSONField(default=list, blank=True, help_text='Chosen options: [{id, name, price}]')
    notes = models.CharField(max_length=200, blank=True)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveSmallIntegerField(default=1)
    line_total = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f'{self.quantity} x {self.name}'

    @property
    def options_label(self):
        return ', '.join(option['name'] for option in self.options)
