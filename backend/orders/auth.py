"""Passwordless customer sign-in: email one-time code -> signed bearer token."""
from django.core import signing

from .models import Customer

TOKEN_SALT = 'khanz.customer'
TOKEN_MAX_AGE = 60 * 60 * 24 * 30  # 30 days


def issue_token(customer):
    return signing.TimestampSigner(salt=TOKEN_SALT).sign(str(customer.pk))


ORDER_SALT = 'khanz.order'


def issue_order_token(order):
    """Lets a guest (no account) view and pay their own order."""
    return signing.TimestampSigner(salt=ORDER_SALT).sign(order.reference)


def order_reference_from_request(request):
    header = request.META.get('HTTP_AUTHORIZATION', '')
    if not header.startswith('Order '):
        return None
    try:
        return signing.TimestampSigner(salt=ORDER_SALT).unsign(header[6:].strip(), max_age=TOKEN_MAX_AGE)
    except signing.BadSignature:
        return None


def customer_from_request(request):
    header = request.META.get('HTTP_AUTHORIZATION', '')
    if not header.startswith('Customer '):
        return None
    try:
        customer_id = signing.TimestampSigner(salt=TOKEN_SALT).unsign(header[9:].strip(), max_age=TOKEN_MAX_AGE)
    except signing.BadSignature:
        return None
    return Customer.objects.filter(pk=customer_id).first()
