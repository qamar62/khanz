from django.contrib import admin

from django.utils import timezone
from django.utils.html import format_html

from .models import Customer, EmailOTP, Order, OrderItem, Promotion


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    fields = ['quantity', 'name', 'options', 'notes', 'unit_price', 'line_total']
    readonly_fields = fields
    can_delete = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['reference', 'kind', 'branch', 'name', 'phone', 'is_guest', 'pickup_at', 'total', 'payment_status', 'status', 'created_at']
    list_filter = ['kind', 'status', 'payment_status', 'branch', 'created_at']
    search_fields = ['reference', 'name', 'email', 'phone', 'reservation__reference']
    list_editable = ['status']
    list_select_related = ['branch']
    date_hierarchy = 'created_at'
    inlines = [OrderItemInline]
    readonly_fields = [
        'reference', 'kind', 'customer', 'reservation', 'subtotal', 'promotion', 'promotion_title', 'discount',
        'card_fee_percent', 'card_fee', 'total',
        'currency', 'payment_status', 'stripe_checkout_session_id', 'stripe_payment_intent_id',
        'created_at', 'updated_at', 'paid_at',
    ]
    fieldsets = (
        ('Order', {'fields': ('reference', 'kind', 'branch', 'status', 'reservation', 'pickup_asap', 'pickup_at', 'notes')}),
        ('Customer', {'fields': ('customer', 'is_guest', 'name', 'email', 'phone')}),
        ('Payment (refunds are made in the Stripe dashboard)', {'fields': (
            'subtotal', 'promotion', 'promotion_title', 'discount', 'card_fee_percent', 'card_fee', 'total',
            'currency', 'payment_status',
            'stripe_checkout_session_id', 'stripe_payment_intent_id', 'paid_at',
        )}),
        ('Timestamps', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['email', 'name', 'phone', 'created_at', 'last_login_at']
    search_fields = ['email', 'name', 'phone']


@admin.register(EmailOTP)
class EmailOTPAdmin(admin.ModelAdmin):
    list_display = ['email', 'created_at', 'expires_at', 'attempts', 'used_at']
    search_fields = ['email']
    readonly_fields = ['email', 'code_hash', 'created_at', 'expires_at', 'attempts', 'used_at']


@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    list_display = ['title', 'state', 'display_badge', 'applies_to', 'starts_at', 'ends_at', 'orders_count', 'is_active']
    list_filter = ['is_active', 'discount_type', 'applies_to']
    list_editable = ['is_active']
    search_fields = ['title', 'description']
    fieldsets = (
        ('Message', {'fields': ('title', 'description', 'badge', 'image', 'cta_label', 'cta_url')}),
        ('Discount (applied automatically at checkout)', {'fields': ('discount_type', 'discount_value', 'min_subtotal', 'applies_to')}),
        ('Schedule', {'fields': ('starts_at', 'ends_at', 'is_active', 'priority')}),
        ('Where to show it', {'fields': ('show_on_home', 'show_on_checkout')}),
    )

    @admin.display(description='Status')
    def state(self, obj):
        now = timezone.now()
        if not obj.is_active:
            label, color = 'Paused', '#6b6b6b'
        elif now < obj.starts_at:
            label, color = 'Scheduled', '#a35d00'
        elif now >= obj.ends_at:
            label, color = 'Expired', '#9f3a38'
        else:
            label, color = 'Live', '#2f7f3f'
        return format_html('<span style="background:{};color:#fff;padding:3px 9px;border-radius:12px;font-weight:600">{}</span>', color, label)

    @admin.display(description='Badge')
    def display_badge(self, obj):
        return obj.display_badge

    @admin.display(description='Paid orders')
    def orders_count(self, obj):
        return obj.orders.filter(payment_status='paid').count()
