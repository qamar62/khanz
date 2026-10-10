from django.contrib import admin
from django.utils.html import format_html

from .models import (
    Branch,
    BranchTimeSlot,
    CateringRequest,
    ContactMessage,
    MenuDocument,
    MenuCategory,
    MenuItem,
    MenuItemOption,
    Payment,
    Reservation,
    ReservationEvent,
    RestaurantTable,
)


STATUS_COLORS = {
    'pending': '#b8860b',
    'payment_pending': '#a35d00',
    'confirmed': '#55733b',
    'waiting': '#72622d',
    'table_ready': '#2f7f68',
    'seated': '#236b8e',
    'completed': '#52606d',
    'cancelled': '#9f3a38',
    'no_show': '#6b3d5c',
}


class PaymentInline(admin.TabularInline):
    model = Payment
    extra = 0
    fields = ['payment_type', 'status', 'amount', 'currency', 'external_payment_intent_id', 'created_at']
    readonly_fields = fields


class ReservationEventInline(admin.TabularInline):
    model = ReservationEvent
    extra = 0
    fields = ['event_type', 'from_status', 'to_status', 'actor', 'note', 'created_at']
    readonly_fields = fields
    can_delete = False


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = [
        'reference', 'name', 'branch_location', 'date', 'time', 'adult_guests',
        'child_guests', 'guests',
        'status_badge', 'payment_status', 'source', 'created_at',
    ]
    list_filter = ['branch_location', 'status', 'payment_status', 'source', 'date', 'occasion']
    search_fields = ['reference', 'name', 'email', 'phone', 'external_reference']
    readonly_fields = [
        'preorder_summary', 'reference', 'branch', 'google_calendar_event_id', 'arrival_time',
        'seated_at', 'completed_at', 'cancelled_at', 'created_at', 'updated_at',
    ]
    filter_horizontal = ['tables']
    date_hierarchy = 'date'
    list_select_related = ['branch_location']
    inlines = [PaymentInline, ReservationEventInline]
    fieldsets = (
        ('Booking', {'fields': ('reference', 'branch_location', 'date', 'time_slot', 'time', 'duration_minutes', 'adult_guests', 'child_guests', 'guests', 'tables')}),
        ('Guest', {'fields': ('name', 'email', 'phone', 'occasion', 'special_requests')}),
        ('Operations', {'fields': ('status', 'source', 'external_reference', 'internal_notes', 'confirmation_attempts')}),
        ('Payment', {'fields': ('payment_status', 'preorder_summary')}),
        ('Integrations', {'fields': ('branch', 'google_calendar_event_id'), 'classes': ('collapse',)}),
        ('Timeline', {'fields': ('arrival_time', 'seated_at', 'completed_at', 'cancelled_at', 'created_at', 'updated_at'), 'classes': ('collapse',)}),
    )
    actions = ['mark_confirmed', 'mark_table_ready', 'mark_seated', 'mark_completed', 'mark_no_show', 'mark_cancelled']

    @admin.display(description='Pre-ordered food')
    def preorder_summary(self, obj):
        order = getattr(obj, 'preorder', None)
        if not order:
            return 'No pre-order'
        items = ', '.join(f'{i.quantity} x {i.name}' for i in order.items.all())
        return format_html(
            '<a href="/admin/orders/order/{}/change/">{}</a> · {} {} ({}) · {}',
            order.pk, order.reference, order.currency, order.total, order.get_payment_status_display(), items,
        )

    @admin.display(description='Status', ordering='status')
    def status_badge(self, obj):
        color = STATUS_COLORS.get(obj.status, '#52606d')
        return format_html('<span style="background:{};color:#fff;padding:4px 9px;border-radius:12px;font-weight:600">{}</span>', color, obj.get_status_display())

    def _update_status(self, request, queryset, value):
        count = queryset.update(status=value)
        self.message_user(request, f'{count} reservation(s) updated to {value}.')

    @admin.action(description='Mark selected as confirmed')
    def mark_confirmed(self, request, queryset): self._update_status(request, queryset, 'confirmed')

    @admin.action(description='Mark selected as table ready')
    def mark_table_ready(self, request, queryset): self._update_status(request, queryset, 'table_ready')

    @admin.action(description='Mark selected as seated')
    def mark_seated(self, request, queryset): self._update_status(request, queryset, 'seated')

    @admin.action(description='Mark selected as completed')
    def mark_completed(self, request, queryset): self._update_status(request, queryset, 'completed')

    @admin.action(description='Mark selected as no-show')
    def mark_no_show(self, request, queryset): self._update_status(request, queryset, 'no_show')

    @admin.action(description='Mark selected as cancelled')
    def mark_cancelled(self, request, queryset): self._update_status(request, queryset, 'cancelled')


class RestaurantTableInline(admin.TabularInline):
    model = RestaurantTable
    extra = 0


class BranchTimeSlotInline(admin.TabularInline):
    model = BranchTimeSlot
    extra = 0
    fields = ['day_of_week', 'start_time', 'capacity', 'is_active', 'sort_order']
    ordering = ['day_of_week', 'start_time']


@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'booking_enabled', 'pickup_enabled', 'online_capacity', 'is_flagship', 'is_active']
    list_filter = ['booking_enabled', 'pickup_enabled', 'is_flagship', 'is_active']
    search_fields = ['name', 'code', 'slug', 'address', 'phone']
    readonly_fields = ['created_at', 'updated_at']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [BranchTimeSlotInline, RestaurantTableInline]
    fieldsets = (
        ('Identity', {'fields': ('name', 'slug', 'code', 'description', 'is_flagship', 'is_active', 'sort_order')}),
        ('Contact', {'fields': ('address', 'phone', 'email', 'hours', 'google_maps_url')}),
        ('Booking rules', {'fields': ('booking_enabled', 'timezone', 'currency', 'booking_interval_minutes', 'default_booking_duration_minutes', 'min_advance_minutes', 'max_advance_days', 'max_online_party_size', 'online_capacity')}),
        ('Online pickup orders', {'fields': ('pickup_enabled', 'pickup_prep_minutes')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )


@admin.register(MenuDocument)
class MenuDocumentAdmin(admin.ModelAdmin):
    list_display = ['title', 'branch', 'version', 'effective_from', 'page_count', 'is_active', 'is_public', 'uploaded_at']
    list_filter = ['branch', 'is_active', 'is_public', 'effective_from']
    search_fields = ['title', 'version', 'original_filename', 'checksum_sha256']
    readonly_fields = ['original_filename', 'file_size', 'checksum_sha256', 'uploaded_at', 'updated_at']


class MenuItemOptionInline(admin.TabularInline):
    model = MenuItemOption
    extra = 0


@admin.register(MenuCategory)
class MenuCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'display_order', 'suggest_at_checkout', 'is_active']
    list_editable = ['display_order', 'suggest_at_checkout', 'is_active']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'category', 'price', 'is_popular', 'is_chef_special', 'is_active', 'display_order']
    list_filter = ['category', 'is_active', 'is_popular', 'is_chef_special', 'branches']
    search_fields = ['code', 'name', 'description']
    list_editable = ['price', 'is_active', 'display_order']
    filter_horizontal = ['branches']
    inlines = [MenuItemOptionInline]


@admin.register(BranchTimeSlot)
class BranchTimeSlotAdmin(admin.ModelAdmin):
    list_display = ['branch', 'day_of_week', 'start_time', 'capacity', 'is_active']
    list_filter = ['branch', 'day_of_week', 'is_active']
    list_editable = ['capacity', 'is_active']
    ordering = ['branch', 'day_of_week', 'start_time']


@admin.register(RestaurantTable)
class RestaurantTableAdmin(admin.ModelAdmin):
    list_display = ['name', 'branch', 'area', 'min_capacity', 'max_capacity', 'is_active', 'sort_order']
    list_filter = ['branch', 'area', 'is_active']
    search_fields = ['name', 'branch__name', 'area']


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['reservation', 'payment_type', 'status', 'amount', 'currency', 'created_at', 'paid_at']
    list_filter = ['provider', 'payment_type', 'status', 'currency']
    search_fields = ['reservation__reference', 'reservation__name', 'external_payment_intent_id']
    readonly_fields = ['idempotency_key', 'created_at', 'updated_at', 'paid_at']


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['name', 'email', 'phone', 'message']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(CateringRequest)
class CateringRequestAdmin(admin.ModelAdmin):
    list_display = ['name', 'event_type', 'event_date', 'guest_count', 'status', 'created_at']
    list_filter = ['status', 'event_type', 'event_date']
    search_fields = ['name', 'email', 'phone', 'venue_address']
    readonly_fields = ['created_at', 'updated_at']
