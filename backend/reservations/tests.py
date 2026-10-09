from datetime import timedelta
from decimal import Decimal

from unittest import mock

from django.contrib.auth import get_user_model
from django.test import override_settings
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Branch, BranchTimeSlot, MenuCategory, MenuDocument, MenuItem, Payment, Reservation, ReservationEvent


class BookingApiTests(APITestCase):
    def setUp(self):
        self.branch = Branch.objects.create(
            name='Khanz Test Branch',
            slug='khanz-test',
            code='TEST',
            address='1 Auckland Road',
            phone='+64 9 000 0000',
            email='test@khanz.co.nz',
            hours='Daily',
            online_capacity=20,
            max_online_party_size=10,
            min_advance_minutes=0,
            deposit_policy='per_guest',
            deposit_amount=Decimal('5.00'),
        )
        self.booking_date = timezone.localdate() + timedelta(days=2)
        self.slot = BranchTimeSlot.objects.create(
            branch=self.branch,
            day_of_week=self.booking_date.weekday(),
            start_time='18:30',
            capacity=20,
        )

    def payload(self):
        return {
            'name': 'Aroha Test',
            'email': 'aroha@example.nz',
            'phone': '+64 21 555 0101',
            'branch_slug': self.branch.slug,
            'date': self.booking_date.isoformat(),
            'time_slot_id': self.slot.id,
            'adult_guests': 2,
            'child_guests': 2,
            'source': 'web',
        }

    @override_settings(STRIPE_SECRET_KEY='sk_test_dummy')
    def test_card_booking_creates_reference_deposit_and_audit_event(self):
        response = self.client.post(reverse('reservation-list'), {**self.payload(), 'payment_method': 'card'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        booking = Reservation.objects.get(pk=response.data['id'])
        self.assertTrue(booking.reference.startswith('KH'))
        self.assertEqual(booking.branch_location, self.branch)
        self.assertEqual(booking.deposit_amount, Decimal('20.00'))
        self.assertEqual(booking.guests, 4)
        self.assertEqual(booking.child_guests, 2)
        self.assertEqual(booking.status, 'payment_pending')
        self.assertEqual(booking.payment_method, 'card')
        self.assertTrue(ReservationEvent.objects.filter(reservation=booking, event_type='created').exists())

    def test_cash_booking_skips_deposit_and_is_pay_on_site(self):
        for method in ['cash', 'cash_on_pickup', 'cash_on_delivery']:
            response = self.client.post(reverse('reservation-list'), {**self.payload(), 'payment_method': method}, format='json')
            self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
            booking = Reservation.objects.get(pk=response.data['id'])
            self.assertEqual(booking.payment_method, method)
            self.assertFalse(booking.deposit_required)
            self.assertEqual(booking.deposit_amount, Decimal('0.00'))
            self.assertEqual(booking.payment_status, 'pay_on_site')
            self.assertEqual(booking.status, 'pending')

    def test_card_rejected_when_stripe_not_configured(self):
        response = self.client.post(reverse('reservation-list'), {**self.payload(), 'payment_method': 'card'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('payment_method', response.data)
        self.assertFalse(Reservation.objects.exists())

    @override_settings(STRIPE_SECRET_KEY='sk_test_dummy')
    def test_card_rejected_when_branch_has_no_deposit(self):
        self.branch.deposit_policy = 'none'
        self.branch.save()
        response = self.client.post(reverse('reservation-list'), {**self.payload(), 'payment_method': 'card'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('payment_method', response.data)

    def test_payment_method_must_be_accepted_by_branch(self):
        self.branch.accepted_payment_methods = ['cash']
        self.branch.save()
        response = self.client.post(reverse('reservation-list'), {**self.payload(), 'payment_method': 'cash_on_delivery'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_branch_api_exposes_payment_options(self):
        response = self.client.get(reverse('branch-detail', kwargs={'slug': self.branch.slug}))
        self.assertIn('accepted_payment_methods', response.data)
        self.assertFalse(response.data['online_payments_enabled'])

    @override_settings(STRIPE_SECRET_KEY='sk_test_dummy')
    def test_expired_unpaid_card_hold_releases_capacity(self):
        response = self.client.post(reverse('reservation-list'), {**self.payload(), 'payment_method': 'card'}, format='json')
        Reservation.objects.filter(pk=response.data['id']).update(created_at=timezone.now() - timedelta(minutes=45))
        availability = self.client.get(reverse('reservation-availability'), {
            'branch': self.branch.slug, 'date': self.booking_date.isoformat(), 'guests': 1,
        })
        self.assertEqual(next(item for item in availability.data['slots'] if item['id'] == self.slot.id)['remaining_capacity'], 20)

    def test_staff_edit_does_not_reset_status(self):
        response = self.client.post(reverse('reservation-list'), {**self.payload(), 'payment_method': 'cash'}, format='json')
        booking = Reservation.objects.get(pk=response.data['id'])
        booking.status = 'confirmed'
        booking.save(update_fields=['status'])
        user = get_user_model().objects.create_user('editor', password='safe-test-password', is_staff=True)
        self.client.force_authenticate(user)
        self.client.patch(reverse('reservation-detail', kwargs={'pk': booking.id}), {'adult_guests': 3}, format='json')
        booking.refresh_from_db()
        self.assertEqual(booking.status, 'confirmed')
        self.assertEqual(booking.guests, 5)

    def test_lookup_requires_matching_email(self):
        response = self.client.post(reverse('reservation-list'), {**self.payload(), 'payment_method': 'cash'}, format='json')
        ref = response.data['reference']
        ok = self.client.get(reverse('reservation-lookup'), {'reference': ref, 'email': 'AROHA@example.nz'})
        self.assertEqual(ok.status_code, 200)
        self.assertEqual(ok.data['payment_method'], 'cash')
        bad = self.client.get(reverse('reservation-lookup'), {'reference': ref, 'email': 'other@example.nz'})
        self.assertEqual(bad.status_code, 404)

    def test_anonymous_customer_cannot_list_bookings(self):
        response = self.client.get(reverse('reservation-list'))
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_availability_reports_capacity(self):
        Reservation.objects.create(
            name='Existing Guest', email='guest@example.nz', phone='1',
            branch_location=self.branch, date=self.booking_date, time='18:30', guests=18,
            adult_guests=16, child_guests=2, time_slot=self.slot,
        )
        response = self.client.get(reverse('reservation-availability'), {
            'branch': self.branch.slug, 'date': self.booking_date.isoformat(), 'guests': 4,
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        slot = next(item for item in response.data['slots'] if item['time'] == '18:30')
        self.assertFalse(slot['available'])
        self.assertEqual(slot['remaining_capacity'], 2)

    def test_cancelled_booking_releases_people_back_to_slot(self):
        response = self.client.post(reverse('reservation-list'), self.payload(), format='json')
        booking = Reservation.objects.get(pk=response.data['id'])
        before = self.client.get(reverse('reservation-availability'), {
            'branch': self.branch.slug, 'date': self.booking_date.isoformat(), 'guests': 1,
        })
        self.assertEqual(next(item for item in before.data['slots'] if item['id'] == self.slot.id)['remaining_capacity'], 16)
        booking.status = 'cancelled'
        booking.save(update_fields=['status'])
        after = self.client.get(reverse('reservation-availability'), {
            'branch': self.branch.slug, 'date': self.booking_date.isoformat(), 'guests': 1,
        })
        self.assertEqual(next(item for item in after.data['slots'] if item['id'] == self.slot.id)['remaining_capacity'], 20)

    def test_staff_guest_update_recalculates_remaining_capacity(self):
        create_response = self.client.post(reverse('reservation-list'), self.payload(), format='json')
        user = get_user_model().objects.create_user('slot-manager', password='safe-test-password', is_staff=True)
        self.client.force_authenticate(user)
        update_response = self.client.patch(
            reverse('reservation-detail', kwargs={'pk': create_response.data['id']}),
            {'adult_guests': 5, 'child_guests': 2}, format='json',
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        availability = self.client.get(reverse('reservation-availability'), {
            'branch': self.branch.slug, 'date': self.booking_date.isoformat(), 'guests': 1,
        })
        self.assertEqual(next(item for item in availability.data['slots'] if item['id'] == self.slot.id)['remaining_capacity'], 13)

    def test_booking_cannot_exceed_remaining_people_capacity(self):
        Reservation.objects.create(
            name='Existing', email='existing@example.nz', phone='1',
            branch_location=self.branch, date=self.booking_date, time='18:30',
            adult_guests=18, child_guests=0, guests=18, time_slot=self.slot,
        )
        payload = self.payload()
        first = self.client.post(reverse('reservation-list'), payload, format='json')
        self.assertEqual(first.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unconfigured_stripe_returns_safe_service_response(self):
        with override_settings(STRIPE_SECRET_KEY='sk_test_dummy'):
            create_response = self.client.post(reverse('reservation-list'), {**self.payload(), 'payment_method': 'card'}, format='json')
        booking_id = create_response.data['id']
        response = self.client.post(
            reverse('reservation-checkout-session', kwargs={'pk': booking_id}),
            {'email': 'aroha@example.nz'}, format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertIn('not configured', response.data['detail'])


class MenuApiTests(APITestCase):
    def test_normalized_menu_api_returns_categories_and_items(self):
        category = MenuCategory.objects.create(name='Mains', slug='mains')
        MenuItem.objects.create(category=category, code='TEST1', name='Test Plate', price='19.99')
        response = self.client.get(reverse('menu-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]['slug'], 'mains')
        self.assertEqual(response.data[0]['items'][0]['code'], 'TEST1')

    def test_public_menu_metadata_has_storage_url(self):
        menu = MenuDocument.objects.create(
            title='Khanz Menu', version='Test',
            file=SimpleUploadedFile('menu.pdf', b'%PDF-1.4 test'),
            page_count=10,
        )
        response = self.client.get(reverse('menu-document-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        result = response.data['results'][0]
        self.assertEqual(result['id'], menu.id)
        self.assertTrue(result['file_url'].endswith('.pdf'))


class StaffBookingApiTests(APITestCase):
    def test_staff_can_use_dashboard_summary(self):
        user = get_user_model().objects.create_user('manager', password='safe-test-password', is_staff=True)
        self.client.force_authenticate(user)
        response = self.client.get(reverse('reservation-summary'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('by_status', response.data)


@override_settings(STRIPE_SECRET_KEY='sk_test_dummy', STRIPE_WEBHOOK_SECRET='whsec_dummy')
class StripeFlowTests(APITestCase):
    setUp = BookingApiTests.setUp
    payload = BookingApiTests.payload

    def _card_booking(self):
        response = self.client.post(reverse('reservation-list'), {**self.payload(), 'payment_method': 'card'}, format='json')
        return Reservation.objects.get(pk=response.data['id'])

    def test_checkout_session_and_expiry_webhook_release_seats(self):
        booking = self._card_booking()
        fake_session = mock.Mock(id='cs_test_1', url='https://checkout.stripe.test/cs_test_1')
        with mock.patch('stripe.checkout.Session.create', return_value=fake_session) as create:
            response = self.client.post(
                reverse('reservation-checkout-session', kwargs={'pk': booking.id}),
                {'email': booking.email}, format='json',
            )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['checkout_url'], fake_session.url)
        self.assertIn('expires_at', create.call_args.kwargs)

        event = {'type': 'checkout.session.expired', 'data': {'object': {'id': 'cs_test_1'}}}
        with mock.patch('stripe.Webhook.construct_event', return_value=event):
            hook = self.client.post(reverse('stripe-webhook'), data=b'{}', content_type='application/json')
        self.assertEqual(hook.status_code, 200)
        booking.refresh_from_db()
        self.assertEqual(booking.status, 'cancelled')
        self.assertEqual(Payment.objects.get(reservation=booking).status, 'cancelled')

    def test_paid_webhook_confirms_booking(self):
        booking = self._card_booking()
        payment = Payment.objects.create(reservation=booking, amount=booking.deposit_amount, external_checkout_session_id='cs_paid')
        event = {'type': 'checkout.session.completed', 'data': {'object': {'id': 'cs_paid', 'payment_status': 'paid', 'payment_intent': 'pi_1'}}}
        with mock.patch('stripe.Webhook.construct_event', return_value=event):
            self.client.post(reverse('stripe-webhook'), data=b'{}', content_type='application/json')
        booking.refresh_from_db()
        payment.refresh_from_db()
        self.assertEqual(booking.payment_status, 'paid')
        self.assertEqual(booking.status, 'confirmed')
        self.assertEqual(payment.status, 'succeeded')
