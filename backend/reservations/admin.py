from django.contrib import admin
from django.utils.html import format_html
from .models import Reservation, ContactMessage, CateringRequest, Branch
from .utils.google_calendar import create_calendar_event, delete_calendar_event


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'date', 'time', 'guests', 'status_badge',
        'occasion', 'created_at'
    ]
    list_filter = ['status', 'date', 'occasion', 'created_at']
    search_fields = ['name', 'email', 'phone']
    readonly_fields = ['google_calendar_event_id', 'created_at', 'updated_at']
    date_hierarchy = 'date'
    
    fieldsets = (
        ('Guest Information', {
            'fields': ('name', 'email', 'phone')
        }),
        ('Reservation Details', {
            'fields': ('date', 'time', 'guests', 'occasion', 'special_requests')
        }),
        ('Status & Tracking', {
            'fields': ('status', 'google_calendar_event_id')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['sync_to_calendar', 'mark_confirmed', 'mark_completed', 'mark_cancelled']
    
    def status_badge(self, obj):
        """Display status with color badge"""
        colors = {
            'pending': '#FFA500',
            'confirmed': '#28A745',
            'cancelled': '#DC3545',
            'completed': '#6C757D',
        }
        color = colors.get(obj.status, '#6C757D')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; '
            'border-radius: 3px; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    
    def sync_to_calendar(self, request, queryset):
        """Sync selected reservations to Google Calendar"""
        count = 0
        for reservation in queryset:
            try:
                if not reservation.google_calendar_event_id:
                    event_id = create_calendar_event(reservation)
                    reservation.google_calendar_event_id = event_id
                    reservation.save()
                    count += 1
            except Exception as e:
                self.message_user(
                    request,
                    f"Failed to sync {reservation.name}: {str(e)}",
                    level='error'
                )
        
        self.message_user(
            request,
            f"Successfully synced {count} reservation(s) to Google Calendar."
        )
    sync_to_calendar.short_description = "Sync to Google Calendar"
    
    def mark_confirmed(self, request, queryset):
        """Mark reservations as confirmed"""
        updated = queryset.update(status='confirmed')
        self.message_user(request, f"{updated} reservation(s) marked as confirmed.")
    mark_confirmed.short_description = "Mark as Confirmed"
    
    def mark_completed(self, request, queryset):
        """Mark reservations as completed"""
        updated = queryset.update(status='completed')
        self.message_user(request, f"{updated} reservation(s) marked as completed.")
    mark_completed.short_description = "Mark as Completed"
    
    def mark_cancelled(self, request, queryset):
        """Mark reservations as cancelled"""
        for reservation in queryset:
            reservation.status = 'cancelled'
            reservation.save()
            
            # Remove from Google Calendar
            if reservation.google_calendar_event_id:
                try:
                    delete_calendar_event(reservation.google_calendar_event_id)
                except Exception:
                    pass
        
        self.message_user(request, f"{queryset.count()} reservation(s) cancelled.")
    mark_cancelled.short_description = "Cancel Reservations"


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'status_badge', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['name', 'email', 'phone', 'message']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Contact Information', {
            'fields': ('name', 'email', 'phone')
        }),
        ('Message', {
            'fields': ('message', 'status')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_read', 'mark_replied', 'archive']
    
    def status_badge(self, obj):
        """Display status with color badge"""
        colors = {
            'new': '#007BFF',
            'read': '#FFA500',
            'replied': '#28A745',
            'archived': '#6C757D',
        }
        color = colors.get(obj.status, '#6C757D')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; '
            'border-radius: 3px; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    
    def mark_read(self, request, queryset):
        updated = queryset.update(status='read')
        self.message_user(request, f"{updated} message(s) marked as read.")
    mark_read.short_description = "Mark as Read"
    
    def mark_replied(self, request, queryset):
        updated = queryset.update(status='replied')
        self.message_user(request, f"{updated} message(s) marked as replied.")
    mark_replied.short_description = "Mark as Replied"
    
    def archive(self, request, queryset):
        updated = queryset.update(status='archived')
        self.message_user(request, f"{updated} message(s) archived.")
    archive.short_description = "Archive Messages"


@admin.register(CateringRequest)
class CateringRequestAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'event_type', 'event_date', 'guest_count',
        'status_badge', 'created_at'
    ]
    list_filter = ['status', 'event_type', 'event_date', 'created_at']
    search_fields = ['name', 'email', 'phone', 'venue_address']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'event_date'
    
    fieldsets = (
        ('Contact Information', {
            'fields': ('name', 'email', 'phone')
        }),
        ('Event Details', {
            'fields': ('event_type', 'event_date', 'guest_count', 'venue_address', 'message')
        }),
        ('Status & Budget', {
            'fields': ('status', 'estimated_budget', 'notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_contacted', 'mark_quoted', 'mark_confirmed']
    
    def status_badge(self, obj):
        """Display status with color badge"""
        colors = {
            'pending': '#FFA500',
            'contacted': '#17A2B8',
            'quoted': '#FFC107',
            'confirmed': '#28A745',
            'cancelled': '#DC3545',
            'completed': '#6C757D',
        }
        color = colors.get(obj.status, '#6C757D')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; '
            'border-radius: 3px; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    
    def mark_contacted(self, request, queryset):
        updated = queryset.update(status='contacted')
        self.message_user(request, f"{updated} request(s) marked as contacted.")
    mark_contacted.short_description = "Mark as Contacted"
    
    def mark_quoted(self, request, queryset):
        updated = queryset.update(status='quoted')
        self.message_user(request, f"{updated} request(s) marked as quoted.")
    mark_quoted.short_description = "Mark as Quoted"
    
    def mark_confirmed(self, request, queryset):
        updated = queryset.update(status='confirmed')
        self.message_user(request, f"{updated} request(s) marked as confirmed.")
    mark_confirmed.short_description = "Mark as Confirmed"


@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone', 'is_flagship', 'is_active', 'created_at']
    list_filter = ['is_flagship', 'is_active', 'created_at']
    search_fields = ['name', 'address', 'phone', 'email']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'address', 'phone', 'email', 'hours')
        }),
        ('Settings', {
            'fields': ('is_flagship', 'is_active')
        }),
        ('Additional Info', {
            'fields': ('google_maps_url', 'description'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
