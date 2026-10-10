from datetime import datetime, timedelta
from decimal import Decimal

import pytz
from django.conf import settings
from django.db import transaction
from django.db.models import Sum
from django.utils import timezone
from rest_framework import serializers

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
    active_bookings,
)


def online_payments_enabled():
    return bool(settings.STRIPE_SECRET_KEY)


class MenuDocumentSerializer(serializers.ModelSerializer):
    branch_slug = serializers.CharField(source='branch.slug', read_only=True, allow_null=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = MenuDocument
        fields = [
            'id', 'title', 'branch_slug', 'version', 'file_url', 'original_filename',
            'file_size', 'checksum_sha256', 'page_count', 'effective_from',
            'expires_on', 'is_active', 'is_public', 'uploaded_at', 'updated_at',
        ]
        read_only_fields = fields

    def get_file_url(self, obj):
        if not obj.file:
            return None
        request = self.context.get('request')
        return request.build_absolute_uri(obj.file.url) if request else obj.file.url


class MenuItemOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItemOption
        fields = ['id', 'name', 'additional_price', 'display_order']
        read_only_fields = fields


class MenuItemSerializer(serializers.ModelSerializer):
    options = MenuItemOptionSerializer(many=True, read_only=True)
    branch_slugs = serializers.SlugRelatedField(
        source='branches', slug_field='slug', many=True, read_only=True,
    )

    class Meta:
        model = MenuItem
        fields = [
            'id', 'code', 'name', 'description', 'price', 'dietary_labels',
            'spice_level', 'is_popular', 'is_chef_special', 'display_order',
            'branch_slugs', 'options',
        ]
        read_only_fields = fields


class MenuCategorySerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()

    class Meta:
        model = MenuCategory
        fields = ['id', 'name', 'slug', 'description', 'display_order', 'suggest_at_checkout', 'items']
        read_only_fields = fields

    def get_items(self, obj):
        items = obj.items.filter(is_active=True).prefetch_related('branches', 'options')
        branch_slug = self.context.get('branch_slug')
        if branch_slug:
            from django.db.models import Q
            items = items.filter(Q(branches__isnull=True) | Q(branches__slug=branch_slug)).distinct()
        return MenuItemSerializer(items, many=True, context=self.context).data


class BranchSerializer(serializers.ModelSerializer):
    online_payments_enabled = serializers.SerializerMethodField()
    card_fee_percent = serializers.SerializerMethodField()

    class Meta:
        model = Branch
        fields = [
            'id', 'slug', 'code', 'name', 'address', 'phone', 'email', 'hours',
            'is_flagship', 'is_active', 'booking_enabled', 'google_maps_url',
            'description', 'timezone', 'currency', 'booking_interval_minutes',
            'default_booking_duration_minutes', 'min_advance_minutes',
            'max_advance_days', 'max_online_party_size', 'deposit_policy',
            'online_capacity', 'deposit_amount', 'online_payments_enabled',
            'pickup_enabled', 'pickup_prep_minutes', 'card_fee_percent', 'sort_order', 'created_at', 'updated_at',
        ]
        read_only_fields = fields

    def get_online_payments_enabled(self, obj):
        return online_payments_enabled()

    def get_card_fee_percent(self, obj):
        return str(getattr(settings, 'CARD_FEE_PERCENT', '2.5'))



class BranchTimeSlotSerializer(serializers.ModelSerializer):
    branch_slug = serializers.CharField(source='branch.slug', read_only=True)
    day_label = serializers.CharField(source='get_day_of_week_display', read_only=True)

    class Meta:
        model = BranchTimeSlot
        fields = [
            'id', 'branch_slug', 'day_of_week', 'day_label', 'start_time',
            'capacity', 'is_active', 'sort_order',
        ]
        read_only_fields = fields


class RestaurantTableSerializer(serializers.ModelSerializer):
    branch_slug = serializers.CharField(source='branch.slug', read_only=True)

    class Meta:
        model = RestaurantTable
        fields = ['id', 'branch_slug', 'name', 'area', 'min_capacity', 'max_capacity', 'is_active', 'sort_order']
        read_only_fields = fields


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'id', 'provider', 'payment_type', 'status', 'amount', 'currency',
            'external_payment_intent_id', 'failure_message', 'created_at',
            'updated_at', 'paid_at',
        ]
        read_only_fields = fields


class ReservationSerializer(serializers.ModelSerializer):
    is_upcoming = serializers.ReadOnlyField()
    ends_at = serializers.DateTimeField(read_only=True)
    branch = serializers.CharField(read_only=True)
    branch_slug = serializers.SlugRelatedField(
        source='branch_location',
        slug_field='slug',
        queryset=Branch.objects.filter(is_active=True, booking_enabled=True),
        write_only=True,
        required=True,
    )
    branch_details = BranchSerializer(source='branch_location', read_only=True)
    time_slot_id = serializers.PrimaryKeyRelatedField(
        source='time_slot', queryset=BranchTimeSlot.objects.filter(is_active=True),
        write_only=True, required=False,
    )
    time_slot_details = BranchTimeSlotSerializer(source='time_slot', read_only=True)
    table_details = RestaurantTableSerializer(source='tables', many=True, read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)
    preorder_items = serializers.ListField(
        child=serializers.DictField(), write_only=True, required=False, allow_empty=True,
        help_text='Optional dishes to pre-order: [{menu_item_id, quantity, option_ids, notes}]',
    )
    preorder = serializers.SerializerMethodField()

    class Meta:
        model = Reservation
        fields = [
            'id', 'reference', 'name', 'email', 'phone', 'branch', 'branch_slug',
            'branch_details', 'date', 'time', 'time_slot_id', 'time_slot_details',
            'duration_minutes', 'ends_at', 'adult_guests', 'child_guests',
            'guests', 'occasion', 'special_requests', 'source', 'status',
            'payment_status', 'payment_method', 'deposit_required', 'deposit_amount',
            'table_details', 'payments', 'preorder_items', 'preorder', 'is_upcoming',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'reference', 'branch', 'branch_details', 'time', 'time_slot_details',
            'guests', 'status', 'payment_status',
            'deposit_required', 'deposit_amount', 'table_details', 'payments',
            'is_upcoming', 'ends_at', 'created_at', 'updated_at',
        ]

    def to_internal_value(self, data):
        mutable = data.copy()
        if not mutable.get('branch_slug') and mutable.get('branch'):
            mutable['branch_slug'] = mutable.get('branch')
        if not mutable.get('adult_guests') and mutable.get('guests'):
            mutable['adult_guests'] = mutable.get('guests')
            mutable.setdefault('child_guests', 0)
        return super().to_internal_value(mutable)

    def validate(self, attrs):
        branch = attrs.get('branch_location') or getattr(self.instance, 'branch_location', None)
        booking_date = attrs.get('date') or getattr(self.instance, 'date', None)
        slot = attrs.get('time_slot') or getattr(self.instance, 'time_slot', None)
        booking_time = slot.start_time if slot else (attrs.get('time') or getattr(self.instance, 'time', None))
        adults = attrs.get('adult_guests', getattr(self.instance, 'adult_guests', 0))
        children = attrs.get('child_guests', getattr(self.instance, 'child_guests', 0))
        guests = adults + children

        if guests < 1:
            raise serializers.ValidationError({'adult_guests': 'At least one adult or child is required.'})
        if not self.instance and not slot:
            raise serializers.ValidationError({'time_slot_id': 'Choose an available booking time.'})
        if slot and branch and slot.branch_id != branch.id:
            raise serializers.ValidationError({'time_slot_id': 'This time belongs to a different branch.'})
        if slot and booking_date and slot.day_of_week != booking_date.weekday():
            raise serializers.ValidationError({'time_slot_id': 'This time is not offered on the selected day.'})

        if booking_date and booking_date < timezone.localdate():
            raise serializers.ValidationError({'date': 'Reservation date cannot be in the past.'})

        raw_preorder = attrs.get('preorder_items') or []
        self._preorder = None
        if raw_preorder and branch and not self.instance:
            if not online_payments_enabled():
                raise serializers.ValidationError({
                    'preorder_items': 'Online payment for pre-orders is unavailable right now. Book without dishes or call us.'
                })
            from orders.pricing import build_lines
            self._preorder = build_lines(raw_preorder, branch)

        if branch and guests and guests > branch.max_online_party_size:
            raise serializers.ValidationError({
                'guests': f'Online reservations are limited to {branch.max_online_party_size} guests at this location.'
            })

        if branch and booking_date and booking_time:
            local_tz = pytz.timezone(branch.timezone)
            requested = local_tz.localize(datetime.combine(booking_date, booking_time))
            now_local = timezone.now().astimezone(local_tz)
            if requested < now_local + timedelta(minutes=branch.min_advance_minutes):
                raise serializers.ValidationError({
                    'time': f'Please book at least {branch.min_advance_minutes // 60} hours in advance.'
                })
            if booking_date > (now_local + timedelta(days=branch.max_advance_days)).date():
                raise serializers.ValidationError({
                    'date': f'Reservations open {branch.max_advance_days} days in advance.'
                })

        return attrs

    def get_preorder(self, obj):
        order = getattr(obj, 'preorder', None) if obj.pk else None
        if not order:
            return None
        return {
            'reference': order.reference, 'currency': order.currency, 'subtotal': str(order.subtotal),
            'promotion_title': order.promotion_title, 'discount': str(order.discount),
            'card_fee_percent': str(order.card_fee_percent), 'card_fee': str(order.card_fee),
            'total': str(order.total), 'payment_status': order.payment_status,
            'items': [{'name': i.name, 'quantity': i.quantity, 'options': i.options, 'line_total': str(i.line_total)}
                      for i in order.items.all()],
        }

    def _capacity_checked_save(self, validated_data, instance=None):
        validated_data.pop('preorder_items', None)
        branch = validated_data['branch_location']
        slot = validated_data.get('time_slot') or (instance.time_slot if instance else None)
        booking_date = validated_data.get('date') or (instance.date if instance else None)
        adults = validated_data.get('adult_guests', instance.adult_guests if instance else 0)
        children = validated_data.get('child_guests', instance.child_guests if instance else 0)
        guests = adults + children
        locked_slot = BranchTimeSlot.objects.select_for_update().get(pk=slot.pk)
        bookings = active_bookings(Reservation.objects.filter(
            time_slot=locked_slot,
            date=booking_date,
        ))
        if instance:
            bookings = bookings.exclude(pk=instance.pk)
        booked_guests = bookings.aggregate(total=Sum('guests'))['total'] or 0
        if booked_guests + guests > locked_slot.capacity:
            raise serializers.ValidationError({
                'time_slot_id': f'Only {max(locked_slot.capacity - booked_guests, 0)} places remain for this time.'
            })

        validated_data.update({
            'time_slot': locked_slot,
            'time': locked_slot.start_time,
            'guests': guests,
        })
        if instance:
            # Staff edits (guests, time, notes...) must not reset status or payment state.
            return super().update(instance, validated_data)

        # No deposits. Pre-ordered food (optional) is paid by card on Stripe: food + card fee.
        preorder = getattr(self, '_preorder', None)
        validated_data.update({
            'payment_method': 'card',
            'duration_minutes': branch.default_booking_duration_minutes,
            'deposit_required': False,
            'deposit_amount': Decimal('0.00'),
            'payment_status': 'unpaid' if preorder else 'not_required',
            'status': 'payment_pending' if preorder else 'pending',
        })
        reservation = super().create(validated_data)
        if preorder:
            from orders.services import create_order
            lines, subtotal = preorder
            local_tz = pytz.timezone(branch.timezone)
            create_order(
                kind='preorder', branch=branch, lines=lines, subtotal=subtotal, reservation=reservation,
                name=reservation.name, email=reservation.email, phone=reservation.phone,
                pickup_at=local_tz.localize(datetime.combine(reservation.date, reservation.time)),
                notes=reservation.special_requests,
            )
        ReservationEvent.objects.create(
            reservation=reservation,
            event_type='created',
            to_status=reservation.status,
            actor=reservation.source,
        )
        return reservation

    def create(self, validated_data):
        with transaction.atomic():
            return self._capacity_checked_save(validated_data)

    def update(self, instance, validated_data):
        validated_data.setdefault('branch_location', instance.branch_location)
        with transaction.atomic():
            return self._capacity_checked_save(validated_data, instance)


class ReservationEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReservationEvent
        fields = ['id', 'event_type', 'from_status', 'to_status', 'note', 'actor', 'metadata', 'created_at']
        read_only_fields = fields


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'phone', 'message', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'status', 'created_at', 'updated_at']

    def validate_message(self, value):
        if not value.strip():
            raise serializers.ValidationError('Message cannot be empty.')
        return value


class CateringRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = CateringRequest
        fields = [
            'id', 'name', 'email', 'phone', 'event_type', 'event_date',
            'guest_count', 'venue_address', 'message', 'status',
            'estimated_budget', 'notes', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'status', 'estimated_budget', 'notes', 'created_at', 'updated_at']

    def validate_event_date(self, value):
        if value < timezone.localdate():
            raise serializers.ValidationError('Event date cannot be in the past.')
        return value

    def validate_guest_count(self, value):
        if value < 10:
            raise serializers.ValidationError('Minimum 10 guests required for catering services.')
        return value
