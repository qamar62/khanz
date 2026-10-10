"""Server-side price calculation. Clients never send prices; only item ids, options and quantities."""
from decimal import ROUND_HALF_UP, Decimal

from django.conf import settings
from django.db.models import Q
from rest_framework.exceptions import ValidationError

from reservations.models import MenuItem

MAX_LINES = 50
MAX_QUANTITY = 50
CENT = Decimal('0.01')


def card_fee_percent():
    return Decimal(str(getattr(settings, 'CARD_FEE_PERCENT', '2.5')))


def card_fee_for(subtotal):
    return (subtotal * card_fee_percent() / Decimal('100')).quantize(CENT, rounding=ROUND_HALF_UP)


def build_lines(raw_items, branch):
    """Validate requested items for a branch and return (lines, subtotal)."""
    if not isinstance(raw_items, list) or not raw_items:
        raise ValidationError({'items': 'Add at least one dish.'})
    if len(raw_items) > MAX_LINES:
        raise ValidationError({'items': f'An order can have at most {MAX_LINES} lines.'})

    ids = []
    for raw in raw_items:
        try:
            ids.append(int(raw.get('menu_item_id')))
        except (TypeError, ValueError, AttributeError):
            raise ValidationError({'items': 'Each line needs a valid menu_item_id.'})
    menu = {
        item.id: item
        for item in MenuItem.objects.filter(id__in=ids, is_active=True, category__is_active=True)
        .filter(Q(branches__isnull=True) | Q(branches=branch)).distinct().prefetch_related('options')
    }

    lines, subtotal = [], Decimal('0.00')
    for raw, item_id in zip(raw_items, ids):
        item = menu.get(item_id)
        if not item:
            raise ValidationError({'items': 'One of the dishes is no longer available at this restaurant.'})
        try:
            quantity = int(raw.get('quantity', 1))
        except (TypeError, ValueError):
            raise ValidationError({'items': 'Quantity must be a number.'})
        if quantity < 1 or quantity > MAX_QUANTITY:
            raise ValidationError({'items': f'Quantity must be between 1 and {MAX_QUANTITY}.'})
        available_options = {option.id: option for option in item.options.all() if option.is_active}
        chosen = []
        for option_id in raw.get('option_ids') or []:
            option = available_options.get(int(option_id)) if str(option_id).isdigit() else None
            if not option:
                raise ValidationError({'items': f'An option for {item.name} is no longer available.'})
            if option.id not in [c['id'] for c in chosen]:
                chosen.append({'id': option.id, 'name': option.name, 'price': str(option.additional_price)})
        unit_price = (item.price + sum(Decimal(c['price']) for c in chosen)).quantize(CENT)
        line_total = (unit_price * quantity).quantize(CENT)
        subtotal += line_total
        lines.append({
            'menu_item': item,
            'menu_item_id': item.id,
            'code': item.code,
            'name': item.name,
            'options': chosen,
            'notes': str(raw.get('notes') or '')[:200],
            'unit_price': unit_price,
            'quantity': quantity,
            'line_total': line_total,
        })
    return lines, subtotal.quantize(CENT)


def best_promotion(subtotal, kind):
    """The live promotion giving the biggest discount for this order type (or None)."""
    from .models import Promotion

    best, best_discount = None, Decimal('0.00')
    for promotion in Promotion.objects.live():
        if not promotion.applies(kind):
            continue
        discount = promotion.discount_for(subtotal)
        if discount > best_discount:
            best, best_discount = promotion, discount
    return best, best_discount


def totals(subtotal, kind='pickup'):
    """Food subtotal - promotion discount, then the card fee on what is actually charged."""
    promotion, discount = best_promotion(subtotal, kind)
    payable = (subtotal - discount).quantize(CENT)
    fee = card_fee_for(payable)
    return {
        'subtotal': subtotal,
        'promotion': promotion,
        'promotion_title': promotion.title if promotion else '',
        'discount': discount,
        'card_fee_percent': card_fee_percent(),
        'card_fee': fee,
        'total': (payable + fee).quantize(CENT),
    }


def public_totals(amounts):
    """JSON-friendly version of totals()."""
    data = {key: str(value) for key, value in amounts.items() if key != 'promotion'}
    promotion = amounts.get('promotion')
    data['promotion'] = {'id': promotion.id, 'title': promotion.title, 'badge': promotion.display_badge} if promotion else None
    return data
