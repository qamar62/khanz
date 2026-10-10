import uuid
from datetime import timedelta
from decimal import Decimal

from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from django.utils import timezone

from reservations.models import ReservationEvent

from .models import Order, OrderItem
from .pricing import totals


class CheckoutUnavailable(Exception):
    pass


def stripe_module():
    if not settings.STRIPE_SECRET_KEY:
        raise CheckoutUnavailable('Online payments are not configured yet.')
    try:
        import stripe
    except ImportError:
        raise CheckoutUnavailable('Stripe support is not installed.')
    stripe.api_key = settings.STRIPE_SECRET_KEY
    return stripe


def create_order(*, kind, branch, lines, subtotal, name, email, phone, customer=None,
                 reservation=None, pickup_asap=False, pickup_at=None, notes=''):
    amounts = totals(subtotal, kind)
    order = Order.objects.create(
        kind=kind, branch=branch, customer=customer, reservation=reservation,
        name=name, email=email, phone=phone, pickup_asap=pickup_asap, pickup_at=pickup_at,
        notes=notes, currency=branch.currency, **amounts,
    )
    OrderItem.objects.bulk_create([
        OrderItem(
            order=order, menu_item=line['menu_item'], code=line['code'], name=line['name'],
            options=line['options'], notes=line['notes'], unit_price=line['unit_price'],
            quantity=line['quantity'], line_total=line['line_total'],
        )
        for line in lines
    ])
    return order


def _cents(amount):
    return int((Decimal(amount) * 100).quantize(Decimal('1')))


def _return_urls(order):
    base = settings.FRONTEND_URL
    if order.kind == 'preorder' and order.reservation_id:
        ref = order.reservation.reference
        return (f'{base}/reservation?payment=success&reference={ref}',
                f'{base}/reservation?payment=cancelled&reference={ref}')
    return (f'{base}/order/{order.reference}?payment=success',
            f'{base}/order/{order.reference}?payment=cancelled')


def checkout_url(order):
    """Open (or reuse) a Stripe Checkout session charging the food total plus the card fee."""
    if order.payment_status == 'paid':
        raise CheckoutUnavailable('This order has already been paid.')
    if order.status == 'cancelled':
        raise CheckoutUnavailable('This order has expired. Please order again.')
    stripe = stripe_module()
    if order.stripe_checkout_session_id:
        existing = stripe.checkout.Session.retrieve(order.stripe_checkout_session_id)
        if existing.status == 'open':
            return existing.url

    currency = order.currency.lower()
    line_items = []
    for item in order.items.all():
        product = {'name': item.name}
        details = ', '.join(filter(None, [item.options_label, item.notes]))
        if details:
            product['description'] = details[:250]
        line_items.append({
            'price_data': {'currency': currency, 'unit_amount': _cents(item.unit_price), 'product_data': product},
            'quantity': item.quantity,
        })
    if order.card_fee > 0:
        line_items.append({
            'price_data': {
                'currency': currency,
                'unit_amount': _cents(order.card_fee),
                'product_data': {'name': f'Card processing fee ({order.card_fee_percent.normalize()}%)'},
            },
            'quantity': 1,
        })
    discounts = []
    if order.discount > 0:
        # Stripe line items can't be negative, so the promotion is a one-off coupon on this session.
        coupon = stripe.Coupon.create(
            amount_off=_cents(order.discount), currency=currency, duration='once',
            name=(order.promotion_title or 'Promotion')[:40],
            metadata={'order_reference': order.reference},
        )
        discounts = [{'coupon': coupon.id}]
    metadata = {'order_id': str(order.id), 'order_reference': order.reference, 'kind': order.kind}
    success_url, cancel_url = _return_urls(order)
    # Stripe requires expires_at at least 30 minutes ahead; add a margin for clock skew and network time.
    hold_minutes = max(getattr(settings, 'PAYMENT_HOLD_MINUTES', 30), 30) + 2
    session = stripe.checkout.Session.create(
        mode='payment',
        **({'customer_email': order.email} if order.email else {}),
        line_items=line_items,
        success_url=success_url,
        cancel_url=cancel_url,
        expires_at=int((timezone.now() + timedelta(minutes=hold_minutes)).timestamp()),
        metadata=metadata,
        **({'discounts': discounts} if discounts else {}),
        payment_intent_data={'metadata': metadata, 'description': f'Khanz order {order.reference}'},
        idempotency_key=f'order:{order.id}:{uuid.uuid4().hex}',
    )
    order.stripe_checkout_session_id = session.id
    order.save(update_fields=['stripe_checkout_session_id', 'updated_at'])
    return session.url


def mark_paid(order, payment_intent=''):
    if order.payment_status == 'paid':
        return
    with transaction.atomic():
        order.payment_status = 'paid'
        if order.status in ('awaiting_payment', 'cancelled'):
            order.status = 'confirmed'
        order.paid_at = timezone.now()
        order.stripe_payment_intent_id = payment_intent or ''
        order.save()
        booking = order.reservation
        if booking:
            old = booking.status
            booking.payment_status = 'paid'
            if booking.status in ('payment_pending', 'pending'):
                booking.status = 'confirmed'
            booking.save(update_fields=['payment_status', 'status', 'updated_at'])
            ReservationEvent.objects.create(
                reservation=booking, event_type='preorder_paid', from_status=old, to_status=booking.status,
                actor='stripe', metadata={'order': order.reference, 'total': str(order.total)},
            )
        transaction.on_commit(lambda: send_order_emails(order))


def cancel_unpaid(order, reason):
    if order.payment_status == 'paid' or order.status == 'cancelled':
        return
    with transaction.atomic():
        order.status = 'cancelled'
        order.payment_status = 'cancelled'
        order.save(update_fields=['status', 'payment_status', 'updated_at'])
        booking = order.reservation
        if booking and booking.status == 'payment_pending':
            old = booking.status
            booking.status = 'cancelled'
            booking.cancelled_at = timezone.now()
            booking.save(update_fields=['status', 'cancelled_at', 'updated_at'])
            ReservationEvent.objects.create(
                reservation=booking, event_type='preorder_expired', from_status=old, to_status='cancelled',
                actor='stripe', note=reason,
            )


def sync_with_stripe(order):
    """Ask Stripe directly whether an unpaid order's checkout was paid.

    The webhook remains the main signal; this covers the moment the customer returns from Stripe
    (and local development, where Stripe's webhook cannot reach localhost).
    """
    if order.payment_status == 'paid' or not order.stripe_checkout_session_id or not settings.STRIPE_SECRET_KEY:
        return order
    try:
        stripe = stripe_module()
        session = stripe.checkout.Session.retrieve(order.stripe_checkout_session_id)
    except Exception:
        return order  # Stripe unreachable: keep current state, the webhook will catch up
    if session.get('payment_status') == 'paid':
        mark_paid(order, session.get('payment_intent') or '')
        order.refresh_from_db()
    return order


def handle_stripe_event(event):
    """Handle Stripe events that belong to food orders. Returns True when the event was an order event."""
    data = event['data']['object']
    order_id = (data.get('metadata') or {}).get('order_id')
    if not order_id:
        return False
    order = Order.objects.select_related('reservation', 'branch').filter(pk=order_id).first()
    if not order:
        return True
    kind = event['type']
    if kind == 'checkout.session.completed' and data.get('payment_status') == 'paid':
        mark_paid(order, data.get('payment_intent') or '')
    elif kind == 'checkout.session.async_payment_succeeded':
        mark_paid(order, data.get('payment_intent') or '')
    elif kind in {'checkout.session.expired', 'checkout.session.async_payment_failed'}:
        cancel_unpaid(order, 'Payment not completed before the hold expired; order (and any table hold) released.')
    elif kind == 'payment_intent.payment_failed' and order.payment_status != 'paid':
        order.payment_status = 'failed'
        order.save(update_fields=['payment_status', 'updated_at'])
    return True


def _order_text(order):
    lines = [
        f"{item.quantity} x {item.name}"
        + (f" ({item.options_label})" if item.options else '')
        + (f" - note: {item.notes}" if item.notes else '')
        + f"  {order.currency} {item.line_total}"
        for item in order.items.all()
    ]
    lines += [
        '',
        f'Subtotal: {order.currency} {order.subtotal}',
    ] + ([f'{order.promotion_title or "Promotion"}: -{order.currency} {order.discount}'] if order.discount > 0 else []) + [
        f'Card fee ({order.card_fee_percent.normalize()}%): {order.currency} {order.card_fee}',
        f'Total paid: {order.currency} {order.total}',
    ]
    return '\n'.join(lines)


def send_order_emails(order):
    when = timezone.localtime(order.pickup_at).strftime('%a %d %b, %I:%M %p') if order.pickup_at else ''
    if order.kind == 'preorder' and order.reservation:
        subject = f'Khanz booking {order.reservation.reference} confirmed'
        intro = (f'Your table at {order.branch.name} on {when} is confirmed, '
                 'and your pre-ordered food is paid.\n\n')
    else:
        timing = f'from around {when}' if order.pickup_asap else f'at {when}'
        subject = f'Khanz pickup order {order.reference} confirmed'
        intro = f'Thanks for your order. Please collect it from {order.branch.name} ({order.branch.address}) {timing}.\n\n'
    body = f'Hi {order.name},\n\n{intro}{_order_text(order)}\n\nKhanz Restaurant Team'
    if order.email:
        send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, [order.email], fail_silently=True)
    staff = [address for address in [order.branch.email or settings.EMAIL_HOST_USER] if address]
    if staff:
        send_mail(
            f'NEW {order.get_kind_display().upper()} {order.reference} - {when}',
            f'{order.name} · {order.phone} · {order.email or "guest, no email"}\n{when}\n\n{_order_text(order)}\n\nNotes: {order.notes or "-"}',
            settings.DEFAULT_FROM_EMAIL, staff, fail_silently=True,
        )
