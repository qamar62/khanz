import logging
import secrets
from datetime import timedelta

from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from reservations.models import Branch

from django.core.validators import validate_email
from django.core.exceptions import ValidationError as DjangoValidationError

from .auth import customer_from_request, issue_order_token, issue_token, order_reference_from_request
from .models import Customer, EmailOTP, Order, Promotion, hash_otp
from .pickup import pickup_options, validate_pickup
from .pricing import build_lines, public_totals, totals
from .serializers import CustomerSerializer, OrderSerializer, PromotionSerializer
from .services import CheckoutUnavailable, checkout_url, create_order, sync_with_stripe

logger = logging.getLogger(__name__)

OTP_TTL_MINUTES = 10
OTP_RESEND_SECONDS = 60
OTP_MAX_ATTEMPTS = 5


class PublicAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []  # customers authenticate with a signed "Customer <token>" header


def pickup_branch(slug):
    branch = Branch.objects.filter(slug=slug, is_active=True).first()
    return branch if branch and branch.pickup_enabled else None


def _money(amounts):
    return {key: str(value) for key, value in amounts.items()}


class OTPRequestView(PublicAPIView):
    def post(self, request):
        email = str(request.data.get('email', '')).strip().lower()
        if '@' not in email or '.' not in email.split('@')[-1] or len(email) > 254:
            return Response({'email': ['Enter a valid email address.']}, status=400)
        if EmailOTP.objects.filter(
            email=email, created_at__gte=timezone.now() - timedelta(seconds=OTP_RESEND_SECONDS),
        ).exists():
            return Response({'detail': 'A code was just sent. Please wait a minute before asking again.'}, status=429)
        code = f'{secrets.randbelow(1_000_000):06d}'
        EmailOTP.objects.filter(email=email, used_at__isnull=True).update(used_at=timezone.now())
        EmailOTP.objects.create(
            email=email, code_hash=hash_otp(email, code),
            expires_at=timezone.now() + timedelta(minutes=OTP_TTL_MINUTES),
        )
        send_mail(
            f'Your Khanz code: {code}',
            f'Your Khanz sign-in code is {code}\n\nIt expires in {OTP_TTL_MINUTES} minutes. '
            'If you did not request it, you can ignore this email.',
            settings.DEFAULT_FROM_EMAIL, [email], fail_silently=True,
        )
        payload = {'sent': True, 'expires_in_minutes': OTP_TTL_MINUTES}
        if settings.DEBUG and settings.EMAIL_BACKEND.endswith('console.EmailBackend'):
            payload['debug_code'] = code  # local development only: emails are printed to the console
        return Response(payload)


class OTPVerifyView(PublicAPIView):
    def post(self, request):
        email = str(request.data.get('email', '')).strip().lower()
        code = str(request.data.get('code', '')).strip()
        otp = EmailOTP.objects.filter(email=email, used_at__isnull=True, expires_at__gt=timezone.now()).first()
        if not otp:
            return Response({'detail': 'That code has expired. Please request a new one.'}, status=400)
        if otp.attempts >= OTP_MAX_ATTEMPTS:
            return Response({'detail': 'Too many attempts. Please request a new code.'}, status=429)
        otp.attempts += 1
        otp.save(update_fields=['attempts'])
        if not otp.matches(code):
            return Response({'detail': 'That code is not right. Please check and try again.'}, status=400)
        otp.used_at = timezone.now()
        otp.save(update_fields=['used_at'])
        customer, _ = Customer.objects.get_or_create(email=email)
        customer.last_login_at = timezone.now()
        customer.save(update_fields=['last_login_at'])
        return Response({'token': issue_token(customer), 'customer': CustomerSerializer(customer).data})


class MeView(PublicAPIView):
    def get(self, request):
        customer = customer_from_request(request)
        if not customer:
            return Response({'detail': 'Please sign in again.'}, status=401)
        orders = Order.objects.filter(customer=customer).exclude(status='cancelled').select_related('branch')[:5]
        return Response({
            'customer': CustomerSerializer(customer).data,
            'recent_orders': OrderSerializer(orders, many=True).data,
        })


class PickupTimesView(PublicAPIView):
    def get(self, request):
        branch = pickup_branch(request.query_params.get('branch'))
        if not branch:
            return Response({'detail': 'This restaurant is not taking pickup orders online.'}, status=400)
        return Response(pickup_options(branch))


class QuoteView(PublicAPIView):
    """Authoritative prices for a cart (the client never sends prices)."""

    def post(self, request):
        branch = Branch.objects.filter(slug=request.data.get('branch'), is_active=True).first()
        if not branch:
            return Response({'detail': 'Choose a restaurant.'}, status=400)
        lines, subtotal = build_lines(request.data.get('items'), branch)
        kind = 'preorder' if request.data.get('kind') == 'preorder' else 'pickup'
        return Response({
            'currency': branch.currency,
            'lines': [
                {**{key: value for key, value in line.items() if key != 'menu_item'},
                 'unit_price': str(line['unit_price']), 'line_total': str(line['line_total'])}
                for line in lines
            ],
            **public_totals(totals(subtotal, kind)),
        })


class LivePromotionsView(PublicAPIView):
    """Promotions running right now, for the home page and checkout."""

    def get(self, request):
        promotions = Promotion.objects.live()
        placement = request.query_params.get('placement')
        if placement == 'home':
            promotions = promotions.filter(show_on_home=True)
        elif placement == 'checkout':
            promotions = promotions.filter(show_on_checkout=True)
        return Response(PromotionSerializer(promotions, many=True, context={'request': request}).data)


class OrderCreateView(PublicAPIView):
    def post(self, request):
        customer = customer_from_request(request)
        guest = customer is None and bool(request.data.get('guest'))
        if not customer and not guest:
            return Response({'detail': 'Please verify your email or continue as a guest.'}, status=401)
        if guest and not getattr(settings, 'GUEST_CHECKOUT_ENABLED', True):
            return Response({'detail': 'Please verify your email to place an order.'}, status=401)
        guest_email = str(request.data.get('email', '')).strip().lower() if guest else ''
        if guest_email:
            try:
                validate_email(guest_email)
            except DjangoValidationError:
                return Response({'email': ['Enter a valid email address, or leave it empty.']}, status=400)
        branch = pickup_branch(request.data.get('branch'))
        if not branch:
            return Response({'detail': 'This restaurant is not taking pickup orders online.'}, status=400)
        name = str(request.data.get('name', '')).strip()[:200]
        phone = str(request.data.get('phone', '')).strip()[:30]
        if not name or not phone:
            return Response({'detail': 'Please add your name and phone number.'}, status=400)
        if not settings.STRIPE_SECRET_KEY:
            return Response({'detail': 'Online payments are not available right now. Please call the restaurant.'}, status=503)
        try:
            asap, pickup_at = validate_pickup(branch, request.data.get('pickup'))
        except ValueError as exc:
            return Response({'pickup': [str(exc)]}, status=400)
        lines, subtotal = build_lines(request.data.get('items'), branch)
        if customer:
            customer.name, customer.phone = name, phone
            customer.save(update_fields=['name', 'phone'])
        order = create_order(
            kind='pickup', branch=branch, lines=lines, subtotal=subtotal, customer=customer,
            name=name, email=customer.email if customer else guest_email, phone=phone,
            pickup_asap=asap, pickup_at=pickup_at, notes=str(request.data.get('notes', ''))[:500],
        )
        if guest:
            Order.objects.filter(pk=order.pk).update(is_guest=True)
            order.is_guest = True
        data = OrderSerializer(order).data
        data['access_token'] = issue_order_token(order)  # lets this browser view/pay the order
        return Response(data, status=status.HTTP_201_CREATED)


def order_for_request(request, reference, email=None):
    """The signed-in owner, or anyone who knows the order's email, may see/pay an order."""
    order = Order.objects.select_related('branch', 'reservation').filter(reference=str(reference).upper()).first()
    if not order:
        return None
    customer = customer_from_request(request)
    if customer and order.customer_id == customer.id:
        return order
    if order_reference_from_request(request) == order.reference:
        return order
    if email and order.email and str(email).strip().lower() == order.email.strip().lower():
        return order
    return None


class OrderDetailView(PublicAPIView):
    def get(self, request, reference):
        order = order_for_request(request, reference, request.query_params.get('email'))
        if not order:
            return Response({'detail': 'Order not found.'}, status=404)
        if request.query_params.get('sync') == '1':
            order = sync_with_stripe(order)
        return Response(OrderSerializer(order).data)


class OrderCheckoutView(PublicAPIView):
    def post(self, request, reference):
        order = order_for_request(request, reference, request.data.get('email'))
        if not order:
            return Response({'detail': 'Order not found.'}, status=404)
        try:
            url = checkout_url(order)
        except CheckoutUnavailable as exc:
            return Response({'detail': str(exc)}, status=409 if order.payment_status == 'paid' else 503)
        except Exception as exc:  # Stripe / network errors
            logger.exception('Stripe checkout failed for order %s', order.reference)
            return Response({'detail': checkout_error_message(exc)}, status=502)
        return Response({'checkout_url': url})


def checkout_error_message(exc):
    message = 'We could not open secure checkout. Please try again in a moment.'
    if settings.DEBUG:  # local development: show Stripe's actual reason
        reason = ' '.join((getattr(exc, 'user_message', None) or str(exc)).split())
        # The useful part (e.g. "getaddrinfo failed", "WinError 10013") is at the end of the message.
        message += f' [Stripe: …{reason[-260:]}]'
    return message
