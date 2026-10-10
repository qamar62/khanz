"""Staff dashboard API.

Staff sign in with their Django admin username/password (is_staff required) and receive a signed,
time-limited token sent as ``Authorization: Staff <token>``. The same token also unlocks the existing
staff-only reservation endpoints, because StaffTokenAuthentication is a default DRF authenticator.
"""
from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import authenticate
from django.db.models import Count, F, Q, Sum
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from reservations.models import Branch, MenuCategory, MenuItem, Reservation

from .models import Customer, Order, OrderItem, Promotion
from .serializers import OrderSerializer
from .staff_auth import StaffTokenAuthentication, issue_staff_token

def money(value):
    """Always two decimals (SQLite sums can come back as '20' instead of '20.00')."""
    return f'{Decimal(value or 0):.2f}'


def _user_payload(user):
    return {
        'username': user.get_username(),
        'name': user.get_full_name() or user.get_username(),
        'email': user.email,
        'is_superuser': user.is_superuser,
    }


class StaffLoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'staff_login'

    def post(self, request):
        user = authenticate(
            request,
            username=str(request.data.get('username', '')).strip(),
            password=str(request.data.get('password', '')),
        )
        if not user or not user.is_active or not user.is_staff:
            return Response({'detail': 'Incorrect username or password, or this account is not staff.'}, status=400)
        return Response({'token': issue_staff_token(user), 'user': _user_payload(user)})


class StaffView(APIView):
    permission_classes = [IsAdminUser]
    authentication_classes = [StaffTokenAuthentication]

    def branch_filter(self, request, field='branch'):
        slug = request.query_params.get('branch')
        return {f'{field}__slug': slug} if slug and slug != 'all' else {}


class StaffMeView(StaffView):
    def get(self, request):
        branches = Branch.objects.filter(is_active=True).values('slug', 'name')
        return Response({'user': _user_payload(request.user), 'branches': list(branches)})


ACTIVE_ORDER_STATUSES = ['confirmed', 'preparing', 'ready']


class StaffOverviewView(StaffView):
    """Today's numbers, the live order queue and upcoming bookings."""

    def get(self, request):
        today = timezone.localdate()
        orders = Order.objects.filter(**self.branch_filter(request)).select_related('branch')
        bookings = Reservation.objects.filter(**self.branch_filter(request, 'branch_location')).select_related('branch_location')
        paid_today = orders.filter(payment_status='paid', paid_at__date=today)
        bookings_today = bookings.filter(date=today).exclude(status__in=['cancelled', 'no_show'])
        totals = paid_today.aggregate(revenue=Sum('total'), count=Count('id'))
        week_start = today - timedelta(days=6)
        return Response({
            'date': today.isoformat(),
            'stats': {
                'revenue_today': money(totals['revenue']),
                'orders_today': totals['count'] or 0,
                'active_orders': orders.filter(status__in=ACTIVE_ORDER_STATUSES).count(),
                'bookings_today': bookings_today.count(),
                'guests_today': bookings_today.aggregate(g=Sum('guests'))['g'] or 0,
                'revenue_7d': money(orders.filter(payment_status='paid', paid_at__date__gte=week_start).aggregate(s=Sum('total'))['s']),
                'pending_bookings': bookings.filter(date__gte=today, status='pending').count(),
            },
            'queue': OrderSerializer(orders.filter(status__in=ACTIVE_ORDER_STATUSES).order_by('pickup_at')[:12], many=True).data,
            'upcoming_bookings': [
                _booking_row(b) for b in bookings.filter(date__gte=today).exclude(status__in=['cancelled', 'no_show', 'completed'])
                .order_by('date', 'time')[:8]
            ],
        })


def _booking_row(b):
    return {
        'id': b.id, 'reference': b.reference, 'name': b.name, 'phone': b.phone, 'date': b.date.isoformat(),
        'time': b.time.strftime('%H:%M'), 'guests': b.guests, 'status': b.status,
        'branch': b.branch_location.name if b.branch_location else b.branch,
    }


ORDER_TRANSITIONS = {
    'confirmed': ['preparing', 'cancelled'],
    'preparing': ['ready', 'cancelled'],
    'ready': ['collected'],
    'awaiting_payment': ['cancelled'],
    'collected': [],
    'cancelled': [],
}


class StaffOrdersView(StaffView):
    def get(self, request):
        qs = Order.objects.filter(**self.branch_filter(request)).select_related('branch', 'reservation').prefetch_related('items')
        state = request.query_params.get('status', 'active')
        if state == 'active':
            qs = qs.filter(status__in=ACTIVE_ORDER_STATUSES)
        elif state != 'all':
            qs = qs.filter(status=state)
        kind = request.query_params.get('kind')
        if kind in ('pickup', 'preorder'):
            qs = qs.filter(kind=kind)
        query = request.query_params.get('q', '').strip()
        if query:
            qs = qs.filter(Q(reference__icontains=query) | Q(name__icontains=query) | Q(phone__icontains=query))
        ordering = 'pickup_at' if state == 'active' else '-created_at'
        return Response(OrderSerializer(qs.order_by(ordering)[:100], many=True).data)


class StaffOrderStatusView(StaffView):
    def patch(self, request, reference):
        order = Order.objects.filter(reference=reference.upper()).first()
        if not order:
            return Response({'detail': 'Order not found.'}, status=404)
        new_status = request.data.get('status')
        if new_status not in ORDER_TRANSITIONS.get(order.status, []):
            return Response({'detail': f'Cannot move an order from "{order.get_status_display()}" to "{new_status}".'}, status=400)
        order.status = new_status
        order.save(update_fields=['status', 'updated_at'])
        return Response(OrderSerializer(order).data)


class StaffMenuView(StaffView):
    def get(self, request):
        categories = MenuCategory.objects.prefetch_related('items__options').order_by('display_order', 'name')
        return Response([{
            'id': c.id, 'name': c.name, 'slug': c.slug, 'is_active': c.is_active,
            'items': [{
                'id': i.id, 'code': i.code, 'name': i.name, 'description': i.description, 'price': str(i.price),
                'is_active': i.is_active, 'is_popular': i.is_popular, 'is_chef_special': i.is_chef_special,
                'spice_level': i.spice_level, 'dietary_labels': i.dietary_labels,
                'options': [{'id': o.id, 'name': o.name, 'additional_price': str(o.additional_price)} for o in i.options.all()],
            } for i in c.items.all().order_by('display_order', 'code')],
        } for c in categories])


class StaffMenuItemView(StaffView):
    EDITABLE = {'is_active', 'is_popular', 'is_chef_special', 'price'}

    def patch(self, request, pk):
        item = MenuItem.objects.filter(pk=pk).first()
        if not item:
            return Response({'detail': 'Dish not found.'}, status=404)
        changed = []
        for field in self.EDITABLE & set(request.data):
            value = request.data[field]
            if field == 'price':
                try:
                    value = Decimal(str(value)).quantize(Decimal('0.01'))
                except Exception:
                    return Response({'price': ['Enter a valid price.']}, status=400)
                if value <= 0:
                    return Response({'price': ['Price must be greater than 0.']}, status=400)
            else:
                value = bool(value)
            setattr(item, field, value)
            changed.append(field)
        if changed:
            item.save(update_fields=changed + ['updated_at'])
        return Response({'id': item.id, 'price': str(item.price), 'is_active': item.is_active,
                         'is_popular': item.is_popular, 'is_chef_special': item.is_chef_special})


class StaffCustomersView(StaffView):
    """Everyone who ordered or booked, grouped by email/phone, with spend and visit counts."""

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        orders = Order.objects.filter(payment_status='paid', **self.branch_filter(request))
        bookings = Reservation.objects.exclude(status='cancelled').filter(**self.branch_filter(request, 'branch_location'))
        if query:
            orders = orders.filter(Q(name__icontains=query) | Q(email__icontains=query) | Q(phone__icontains=query))
            bookings = bookings.filter(Q(name__icontains=query) | Q(email__icontains=query) | Q(phone__icontains=query))
        people = {}

        def key(email, phone):
            return (email or '').strip().lower() or (phone or '').strip()

        for row in orders.values('name', 'email', 'phone').annotate(n=Count('id'), spend=Sum('total'), last=F('created_at')).order_by('created_at'):
            entry = people.setdefault(key(row['email'], row['phone']), {
                'name': row['name'], 'email': row['email'], 'phone': row['phone'],
                'orders': 0, 'spend': Decimal('0.00'), 'bookings': 0, 'last_seen': None,
            })
            entry['orders'] += row['n']
            entry['spend'] += row['spend'] or 0
            entry['last_seen'] = max(filter(None, [entry['last_seen'], row['last'].date()]))
        for b in bookings.values('name', 'email', 'phone', 'date'):
            entry = people.setdefault(key(b['email'], b['phone']), {
                'name': b['name'], 'email': b['email'], 'phone': b['phone'],
                'orders': 0, 'spend': Decimal('0.00'), 'bookings': 0, 'last_seen': None,
            })
            entry['bookings'] += 1
            entry['last_seen'] = max(filter(None, [entry['last_seen'], b['date']]))
        rows = sorted(people.values(), key=lambda p: (p['last_seen'] or timezone.localdate() - timedelta(days=9999)), reverse=True)[:200]
        for row in rows:
            row['spend'] = money(row['spend'])
            row['last_seen'] = row['last_seen'].isoformat() if row['last_seen'] else None
        return Response({'count': len(rows), 'verified_accounts': Customer.objects.count(), 'results': rows})


class StaffSalesView(StaffView):
    def get(self, request):
        try:
            days = min(max(int(request.query_params.get('days', 30)), 1), 365)
        except ValueError:
            days = 30
        start = timezone.localdate() - timedelta(days=days - 1)
        paid = Order.objects.filter(payment_status='paid', paid_at__date__gte=start, **self.branch_filter(request))
        daily = {
            row['day']: row for row in paid.annotate(day=TruncDate('paid_at')).values('day')
            .annotate(revenue=Sum('total'), orders=Count('id'), discount=Sum('discount'), fees=Sum('card_fee'))
        }
        series = []
        for offset in range(days):
            day = start + timedelta(days=offset)
            row = daily.get(day, {})
            series.append({'date': day.isoformat(), 'revenue': money(row.get('revenue')), 'orders': row.get('orders') or 0})
        totals = paid.aggregate(revenue=Sum('total'), orders=Count('id'), discount=Sum('discount'), fees=Sum('card_fee'), food=Sum('subtotal'))
        top = (OrderItem.objects.filter(order__in=paid).values('name')
               .annotate(quantity=Sum('quantity'), revenue=Sum('line_total')).order_by('-quantity')[:10])
        by_kind = list(paid.values('kind').annotate(revenue=Sum('total'), orders=Count('id')))
        return Response({
            'days': days,
            'series': series,
            'totals': {k: (v or 0) if k == 'orders' else money(v) for k, v in totals.items()},
            'average_order': str(((totals['revenue'] or Decimal('0')) / totals['orders']).quantize(Decimal('0.01'))) if totals['orders'] else '0.00',
            'top_items': [{**t, 'revenue': money(t['revenue'])} for t in top],
            'by_kind': [{**k, 'revenue': money(k['revenue'])} for k in by_kind],
        })


class StaffPromotionsView(StaffView):
    def get(self, request):
        now = timezone.now()
        rows = []
        for p in Promotion.objects.annotate(paid_orders=Count('orders', filter=Q(orders__payment_status='paid')),
                                            discount_given=Sum('orders__discount', filter=Q(orders__payment_status='paid'))):
            state = 'paused' if not p.is_active else 'scheduled' if now < p.starts_at else 'expired' if now >= p.ends_at else 'live'
            rows.append({
                'id': p.id, 'title': p.title, 'badge': p.display_badge, 'state': state, 'applies_to': p.get_applies_to_display(),
                'starts_at': p.starts_at.isoformat(), 'ends_at': p.ends_at.isoformat(),
                'min_subtotal': str(p.min_subtotal), 'paid_orders': p.paid_orders,
                'discount_given': money(p.discount_given),
            })
        order = {'live': 0, 'scheduled': 1, 'paused': 2, 'expired': 3}
        return Response(sorted(rows, key=lambda r: order[r['state']]))
