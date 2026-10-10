import uuid
from datetime import datetime, timedelta
from decimal import Decimal

from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from django.db.models import Count, Q, Sum
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Branch,
    BranchTimeSlot,
    CateringRequest,
    ContactMessage,
    MenuDocument,
    MenuCategory,
    Payment,
    Reservation,
    ReservationEvent,
    RestaurantTable,
    active_bookings,
)
from .serializers import (
    BranchSerializer,
    BranchTimeSlotSerializer,
    CateringRequestSerializer,
    ContactMessageSerializer,
    MenuDocumentSerializer,
    MenuCategorySerializer,
    PaymentSerializer,
    ReservationEventSerializer,
    ReservationSerializer,
    RestaurantTableSerializer,
)
from .utils.google_calendar import create_calendar_event, delete_calendar_event


def _load_stripe():
    """Return the configured stripe module, or a 503 Response explaining why not."""
    if not settings.STRIPE_SECRET_KEY:
        return None, Response({'detail': 'Online payments are not configured yet.'}, status=503)
    try:
        import stripe
    except ImportError:
        return None, Response({'detail': 'Stripe support is not installed.'}, status=503)
    stripe.api_key = settings.STRIPE_SECRET_KEY
    return stripe, None


def _open_deposit_payment(reservation):
    payment = Payment.objects.filter(
        reservation=reservation,
        payment_type='deposit',
    ).exclude(status__in=['failed', 'cancelled', 'refunded']).first()
    if not payment:
        payment = Payment.objects.create(
            reservation=reservation,
            amount=reservation.deposit_amount,
            currency=reservation.branch_location.currency if reservation.branch_location else 'NZD',
        )
    return payment


class PublicCreateStaffManageMixin:
    """Public forms may create records; customer data is staff-only after creation."""

    public_actions = {'create'}

    def get_permissions(self):
        classes = [AllowAny] if self.action in self.public_actions else [IsAdminUser]
        return [permission() for permission in classes]


class ReservationViewSet(PublicCreateStaffManageMixin, viewsets.ModelViewSet):
    serializer_class = ReservationSerializer
    public_actions = {'create', 'availability', 'payment_intent', 'checkout_session', 'lookup'}

    def get_queryset(self):
        queryset = Reservation.objects.select_related('branch_location').prefetch_related('tables', 'payments')
        if self.action == 'list':  # staff dashboard filters
            params = self.request.query_params
            if params.get('date'):
                queryset = queryset.filter(date=params['date'])
            if params.get('branch') and params['branch'] != 'all':
                queryset = queryset.filter(branch_location__slug=params['branch'])
            if params.get('status') and params['status'] != 'all':
                queryset = queryset.filter(status=params['status'])
            if params.get('q'):
                q = params['q']
                queryset = queryset.filter(Q(name__icontains=q) | Q(reference__icontains=q) | Q(phone__icontains=q) | Q(email__icontains=q))
            queryset = queryset.order_by('date', 'time')
        return queryset

    def perform_create(self, serializer):
        reservation = serializer.save()
        if getattr(settings, 'GOOGLE_CALENDAR_ENABLED', False):
            try:
                reservation.google_calendar_event_id = create_calendar_event(reservation)
                reservation.save(update_fields=['google_calendar_event_id', 'updated_at'])
            except Exception:
                ReservationEvent.objects.create(
                    reservation=reservation,
                    event_type='calendar_sync_failed',
                    note='Google Calendar event could not be created.',
                    actor='system',
                )
        self.send_confirmation_email(reservation)

    def perform_destroy(self, instance):
        if instance.google_calendar_event_id:
            try:
                delete_calendar_event(instance.google_calendar_event_id)
            except Exception:
                pass
        instance.delete()

    def _transition(self, reservation, new_status, actor, note=''):
        old_status = reservation.status
        reservation.status = new_status
        update_fields = ['status', 'updated_at']
        now = timezone.now()
        if new_status == 'seated':
            reservation.seated_at = now
            update_fields.append('seated_at')
        elif new_status == 'completed':
            reservation.completed_at = now
            update_fields.append('completed_at')
        elif new_status == 'cancelled':
            reservation.cancelled_at = now
            update_fields.append('cancelled_at')
        reservation.save(update_fields=update_fields)
        ReservationEvent.objects.create(
            reservation=reservation,
            event_type='status_changed',
            from_status=old_status,
            to_status=new_status,
            actor=actor,
            note=note,
        )

    @action(detail=True, methods=['post'])
    def transition(self, request, pk=None):
        reservation = self.get_object()
        new_status = request.data.get('status')
        if new_status not in dict(Reservation.STATUS_CHOICES):
            return Response({'status': ['Invalid reservation status.']}, status=status.HTTP_400_BAD_REQUEST)
        self._transition(reservation, new_status, request.user.get_username(), request.data.get('note', ''))
        return Response(self.get_serializer(reservation).data)

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        reservation = self.get_object()
        self._transition(reservation, 'confirmed', request.user.get_username())
        self.send_confirmation_email(reservation)
        return Response(self.get_serializer(reservation).data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        reservation = self.get_object()
        self._transition(reservation, 'cancelled', request.user.get_username(), request.data.get('note', ''))
        if reservation.google_calendar_event_id:
            try:
                delete_calendar_event(reservation.google_calendar_event_id)
            except Exception:
                pass
        return Response(self.get_serializer(reservation).data)

    @action(detail=True, methods=['post'], url_path='allocate-tables')
    def allocate_tables(self, request, pk=None):
        reservation = self.get_object()
        table_ids = request.data.get('table_ids', [])
        tables = RestaurantTable.objects.filter(
            id__in=table_ids,
            branch=reservation.branch_location,
            is_active=True,
        )
        if tables.count() != len(set(table_ids)):
            return Response({'table_ids': ['One or more tables are invalid for this branch.']}, status=400)
        if sum(item.max_capacity for item in tables) < reservation.guests:
            return Response({'table_ids': ['Selected tables do not have enough capacity.']}, status=400)
        reservation.tables.set(tables)
        ReservationEvent.objects.create(
            reservation=reservation,
            event_type='tables_allocated',
            actor=request.user.get_username(),
            metadata={'table_ids': list(tables.values_list('id', flat=True))},
        )
        return Response(self.get_serializer(reservation).data)

    @action(detail=True, methods=['get'])
    def events(self, request, pk=None):
        return Response(ReservationEventSerializer(self.get_object().events.all(), many=True).data)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        booking_date = request.query_params.get('date', timezone.localdate().isoformat())
        branch_slug = request.query_params.get('branch')
        queryset = self.get_queryset().filter(date=booking_date)
        if branch_slug:
            queryset = queryset.filter(branch_location__slug=branch_slug)
        by_status = {row['status']: row['count'] for row in queryset.values('status').annotate(count=Count('id'))}
        totals = queryset.aggregate(bookings=Count('id'), guests=Sum('guests'))
        return Response({
            'date': booking_date,
            'branch': branch_slug,
            'bookings': totals['bookings'] or 0,
            'guests': totals['guests'] or 0,
            'by_status': by_status,
        })

    @action(detail=False, methods=['get'])
    def availability(self, request):
        branch_slug = request.query_params.get('branch')
        booking_date = request.query_params.get('date')
        try:
            guests = int(request.query_params.get('guests', 1))
            branch = Branch.objects.get(slug=branch_slug, is_active=True, booking_enabled=True)
            selected_date = datetime.strptime(booking_date, '%Y-%m-%d').date()
        except (Branch.DoesNotExist, TypeError, ValueError):
            return Response({'detail': 'A valid branch and date are required.'}, status=400)

        if guests < 1 or guests > branch.max_online_party_size:
            return Response({'guests': [f'Party size must be between 1 and {branch.max_online_party_size}.']}, status=400)

        branch_slots = list(BranchTimeSlot.objects.filter(
            branch=branch,
            day_of_week=selected_date.weekday(),
            is_active=True,
        ))
        booked_by_slot = {
            row['time_slot_id']: row['total'] or 0
            for row in active_bookings(Reservation.objects.filter(
                branch_location=branch,
                date=selected_date,
                time_slot__in=branch_slots,
            )).values('time_slot_id').annotate(total=Sum('guests'))
        }
        slots = []
        for slot in branch_slots:
            booked_guests = booked_by_slot.get(slot.id, 0)
            remaining = max(slot.capacity - booked_guests, 0)
            slots.append({
                'id': slot.id,
                'time': slot.start_time.strftime('%H:%M'),
                'label': slot.start_time.strftime('%I:%M %p').lstrip('0'),
                'available': remaining >= guests,
                'capacity': slot.capacity,
                'booked_guests': booked_guests,
                'remaining_capacity': remaining,
            })
        return Response({'branch': BranchSerializer(branch, context={'request': request}).data, 'date': booking_date, 'slots': slots})

    @action(detail=True, methods=['post'], url_path='payment-intent')
    def payment_intent(self, request, pk=None):
        reservation = self.get_object()
        if request.data.get('email', '').strip().lower() != reservation.email.strip().lower():
            return Response({'detail': 'Reservation details do not match.'}, status=403)
        if not reservation.deposit_required or reservation.deposit_amount <= 0:
            return Response({'detail': 'No deposit is required for this reservation.'}, status=400)
        if reservation.payment_status == 'paid':
            return Response({'detail': 'This deposit has already been paid.'}, status=400)
        stripe, error = _load_stripe()
        if error:
            return error
        payment = _open_deposit_payment(reservation)
        intent = stripe.PaymentIntent.create(
            amount=int(payment.amount * Decimal('100')),
            currency=payment.currency.lower(),
            automatic_payment_methods={'enabled': True},
            receipt_email=reservation.email,
            metadata={
                'reservation_id': str(reservation.id),
                'reservation_reference': reservation.reference,
                'payment_id': str(payment.id),
            },
            idempotency_key=f'{payment.idempotency_key}:intent',
        )
        payment.external_payment_intent_id = intent.id
        payment.status = 'requires_payment'
        payment.save(update_fields=['external_payment_intent_id', 'status', 'updated_at'])
        return Response({
            'client_secret': intent.client_secret,
            'publishable_key': settings.STRIPE_PUBLISHABLE_KEY,
            'payment': PaymentSerializer(payment).data,
        })

    @action(detail=True, methods=['post'], url_path='checkout-session')
    def checkout_session(self, request, pk=None):
        """Pay for the reservation's pre-ordered food (food total + card fee) on Stripe Checkout."""
        from orders.services import CheckoutUnavailable, checkout_url

        reservation = self.get_object()
        if request.data.get('email', '').strip().lower() != reservation.email.strip().lower():
            return Response({'detail': 'Reservation details do not match.'}, status=403)
        order = getattr(reservation, 'preorder', None)
        if not order:
            return Response({'detail': 'There is nothing to pay for this reservation.'}, status=400)
        if reservation.status == 'cancelled':
            return Response({'detail': 'This reservation hold has expired. Please book again.'}, status=410)
        try:
            url = checkout_url(order)
        except CheckoutUnavailable as exc:
            return Response({'detail': str(exc)}, status=409 if order.payment_status == 'paid' else 503)
        except Exception as exc:  # Stripe / network errors
            ReservationEvent.objects.create(
                reservation=reservation, event_type='checkout_failed', actor='stripe', note=str(exc)[:500],
            )
            from orders.views import checkout_error_message
            return Response({'detail': checkout_error_message(exc)}, status=502)
        return Response({'checkout_url': url})

    @action(detail=False, methods=['get'])
    def lookup(self, request):
        """Minimal public status check (reference + email) used by the payment return page."""
        reference = request.query_params.get('reference', '').strip().upper()
        email = request.query_params.get('email', '').strip().lower()
        reservation = Reservation.objects.select_related('branch_location').filter(reference=reference).first()
        if not reservation or reservation.email.strip().lower() != email:
            return Response({'detail': 'Reservation not found.'}, status=404)
        if request.query_params.get('sync') == '1' and hasattr(reservation, 'preorder'):
            from orders.services import sync_with_stripe
            sync_with_stripe(reservation.preorder)
            reservation.refresh_from_db()
        return Response({
            'id': reservation.id,
            'reference': reservation.reference,
            'status': reservation.status,
            'payment_status': reservation.payment_status,
            'payment_method': reservation.payment_method,
            'deposit_required': reservation.deposit_required,
            'deposit_amount': str(reservation.deposit_amount),
            'date': reservation.date.isoformat(),
            'time': reservation.time.strftime('%H:%M'),
            'adult_guests': reservation.adult_guests,
            'child_guests': reservation.child_guests,
            'branch_name': reservation.branch_location.name if reservation.branch_location else reservation.branch,
            'currency': reservation.branch_location.currency if reservation.branch_location else 'NZD',
            'preorder_total': str(reservation.preorder.total) if hasattr(reservation, 'preorder') else None,
        })

    def send_confirmation_email(self, reservation):
        branch_name = reservation.branch_location.name if reservation.branch_location else reservation.branch
        subject = f'Khanz reservation {reservation.reference}'
        message = (
            f'Dear {reservation.name},\n\nWe received your reservation request.\n\n'
            f'Reference: {reservation.reference}\nBranch: {branch_name}\n'
            f'Date: {reservation.date:%A, %d %B %Y}\nTime: {reservation.time:%I:%M %p}\n'
            f'Guests: {reservation.guests}\nStatus: {reservation.get_status_display()}\n'
            + (f'Pre-ordered food: {reservation.preorder.currency} {reservation.preorder.total} by card '
               f'({reservation.preorder.get_payment_status_display()})\n'
               if hasattr(reservation, 'preorder') else '')
            + '\n'
            'We will contact you if anything else is required.\n\nKhanz Restaurant Team'
        )
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [reservation.email], fail_silently=True)


class StripeWebhookView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        if not settings.STRIPE_WEBHOOK_SECRET:
            return Response({'detail': 'Stripe webhooks are not configured.'}, status=503)
        stripe, error = _load_stripe()
        if error:
            return error
        try:
            event = stripe.Webhook.construct_event(
                request.body,
                request.META.get('HTTP_STRIPE_SIGNATURE', ''),
                settings.STRIPE_WEBHOOK_SECRET,
            )
        except (ValueError, stripe.error.SignatureVerificationError):
            return Response({'detail': 'Invalid Stripe webhook.'}, status=400)

        from orders.services import handle_stripe_event
        if handle_stripe_event(event):  # pickup orders and reservation pre-orders
            return Response({'received': True})

        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            payment = Payment.objects.filter(external_checkout_session_id=session['id']).select_related('reservation').first()
            if payment and session.get('payment_status') == 'paid' and payment.reservation.payment_status != 'paid':
                with transaction.atomic():
                    payment.status = 'succeeded'
                    payment.external_payment_intent_id = session.get('payment_intent')
                    payment.paid_at = timezone.now()
                    payment.save()
                    payment.reservation.payment_status = 'paid'
                    if payment.reservation.status == 'payment_pending':
                        payment.reservation.status = 'confirmed'
                    payment.reservation.save()
                    transaction.on_commit(lambda r=payment.reservation: ReservationViewSet().send_confirmation_email(r))
                    ReservationEvent.objects.create(
                        reservation=payment.reservation,
                        event_type='checkout.session.completed',
                        actor='stripe',
                        metadata={'checkout_session': session['id']},
                    )
        elif event['type'] == 'checkout.session.expired':
            # Customer never paid within the hold window: release the seats.
            session = event['data']['object']
            payment = Payment.objects.filter(external_checkout_session_id=session['id']).select_related('reservation').first()
            if payment and payment.status != 'succeeded':
                with transaction.atomic():
                    payment.status = 'cancelled'
                    payment.save(update_fields=['status', 'updated_at'])
                    booking = payment.reservation
                    if booking.status == 'payment_pending' and booking.payment_status != 'paid':
                        old_status = booking.status
                        booking.status = 'cancelled'
                        booking.cancelled_at = timezone.now()
                        booking.save(update_fields=['status', 'cancelled_at', 'updated_at'])
                        ReservationEvent.objects.create(
                            reservation=booking,
                            event_type='checkout.session.expired',
                            from_status=old_status,
                            to_status='cancelled',
                            actor='stripe',
                            note='Deposit not paid before the hold expired; seats released.',
                            metadata={'checkout_session': session['id']},
                        )
        elif event['type'] in {'payment_intent.succeeded', 'payment_intent.payment_failed', 'payment_intent.canceled'}:
            intent = event['data']['object']
            payment = Payment.objects.filter(external_payment_intent_id=intent['id']).select_related('reservation').first()
            if payment:
                with transaction.atomic():
                    if event['type'] == 'payment_intent.succeeded':
                        payment.status = 'succeeded'
                        payment.paid_at = timezone.now()
                        already_paid = payment.reservation.payment_status == 'paid'
                        payment.reservation.payment_status = 'paid'
                        if payment.reservation.status == 'payment_pending':
                            payment.reservation.status = 'confirmed'
                        if not already_paid:
                            transaction.on_commit(lambda r=payment.reservation: ReservationViewSet().send_confirmation_email(r))
                    elif event['type'] == 'payment_intent.payment_failed':
                        payment.status = 'failed'
                        payment.failure_message = intent.get('last_payment_error', {}).get('message', '')
                        payment.reservation.payment_status = 'failed'
                    else:
                        payment.status = 'cancelled'
                    payment.save()
                    payment.reservation.save()
                    ReservationEvent.objects.create(
                        reservation=payment.reservation,
                        event_type=event['type'],
                        actor='stripe',
                        metadata={'payment_intent': intent['id']},
                    )
        return Response({'received': True})


class ContactMessageViewSet(PublicCreateStaffManageMixin, viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer

    def perform_create(self, serializer):
        message = serializer.save()
        send_mail(
            f'New Khanz contact message from {message.name}',
            f'Email: {message.email}\nPhone: {message.phone or "Not provided"}\n\n{message.message}',
            settings.DEFAULT_FROM_EMAIL,
            [settings.EMAIL_HOST_USER] if settings.EMAIL_HOST_USER else [],
            fail_silently=True,
        )

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        item = self.get_object()
        item.status = 'read'
        item.save(update_fields=['status', 'updated_at'])
        return Response({'status': 'read'})

    @action(detail=True, methods=['post'])
    def mark_replied(self, request, pk=None):
        item = self.get_object()
        item.status = 'replied'
        item.save(update_fields=['status', 'updated_at'])
        return Response({'status': 'replied'})


class CateringRequestViewSet(PublicCreateStaffManageMixin, viewsets.ModelViewSet):
    queryset = CateringRequest.objects.all()
    serializer_class = CateringRequestSerializer

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        item = self.get_object()
        new_status = request.data.get('status')
        if new_status not in dict(CateringRequest.STATUS_CHOICES):
            return Response({'status': ['Invalid status.']}, status=400)
        item.status = new_status
        item.save(update_fields=['status', 'updated_at'])
        return Response(self.get_serializer(item).data)


class BranchViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    serializer_class = BranchSerializer
    lookup_field = 'slug'
    queryset = Branch.objects.filter(is_active=True).prefetch_related('time_slots')


class MenuDocumentViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    serializer_class = MenuDocumentSerializer

    def get_queryset(self):
        queryset = MenuDocument.objects.filter(is_active=True, is_public=True).select_related('branch')
        branch = self.request.query_params.get('branch')
        return queryset.filter(branch__slug=branch) if branch else queryset


class MenuCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    serializer_class = MenuCategorySerializer
    pagination_class = None
    queryset = MenuCategory.objects.filter(is_active=True).prefetch_related('items__branches', 'items__options')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['branch_slug'] = self.request.query_params.get('branch')
        return context


class BranchTimeSlotViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAdminUser]
    serializer_class = BranchTimeSlotSerializer

    def get_queryset(self):
        queryset = BranchTimeSlot.objects.select_related('branch')
        branch = self.request.query_params.get('branch')
        return queryset.filter(branch__slug=branch) if branch else queryset


class RestaurantTableViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAdminUser]
    serializer_class = RestaurantTableSerializer

    def get_queryset(self):
        queryset = RestaurantTable.objects.filter(is_active=True).select_related('branch')
        branch = self.request.query_params.get('branch')
        return queryset.filter(branch__slug=branch) if branch else queryset
