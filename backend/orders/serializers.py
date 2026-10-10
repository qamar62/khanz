from rest_framework import serializers

from .models import Customer, Order, OrderItem, Promotion


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['email', 'name', 'phone']
        read_only_fields = ['email']


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'menu_item', 'code', 'name', 'options', 'notes', 'unit_price', 'quantity', 'line_total']
        read_only_fields = fields


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    branch_slug = serializers.CharField(source='branch.slug', read_only=True)
    branch_address = serializers.CharField(source='branch.address', read_only=True)
    branch_phone = serializers.CharField(source='branch.phone', read_only=True)
    reservation_reference = serializers.CharField(source='reservation.reference', read_only=True, default=None)

    class Meta:
        model = Order
        fields = [
            'reference', 'kind', 'status', 'payment_status', 'name', 'email', 'phone',
            'branch_name', 'branch_slug', 'branch_address', 'branch_phone', 'reservation_reference',
            'pickup_asap', 'pickup_at', 'notes', 'currency', 'subtotal', 'promotion_title', 'discount', 'card_fee_percent',
            'card_fee', 'total', 'items', 'created_at', 'paid_at',
        ]
        read_only_fields = fields


class PromotionSerializer(serializers.ModelSerializer):
    badge = serializers.CharField(source='display_badge', read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Promotion
        fields = [
            'id', 'title', 'description', 'badge', 'image_url', 'discount_type', 'discount_value',
            'min_subtotal', 'applies_to', 'starts_at', 'ends_at', 'cta_label', 'cta_url',
        ]
        read_only_fields = fields

    def get_image_url(self, obj):
        if not obj.image:
            return None
        request = self.context.get('request')
        return request.build_absolute_uri(obj.image.url) if request else obj.image.url
