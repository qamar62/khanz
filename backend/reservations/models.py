from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


class Reservation(models.Model):
    """Table reservation model"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
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
    date = models.DateField()
    time = models.TimeField()
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
    
    # Status and Tracking
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    google_calendar_event_id = models.CharField(max_length=255, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date', '-time']
        verbose_name = 'Reservation'
        verbose_name_plural = 'Reservations'
    
    def __str__(self):
        return f"{self.name} - {self.date} at {self.time} ({self.guests} guests)"
    
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
    
    name = models.CharField(max_length=200)
    address = models.TextField()
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    hours = models.CharField(max_length=200)
    is_flagship = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    # Additional Info
    google_maps_url = models.URLField(blank=True)
    description = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_flagship', 'name']
        verbose_name = 'Branch'
        verbose_name_plural = 'Branches'
    
    def __str__(self):
        return self.name
