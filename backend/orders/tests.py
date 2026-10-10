from datetime import datetime, time, timedelta
from decimal import Decimal
from unittest import mock

import pytz
from django.test import override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase

from reservations.models import (
    Branch, BranchTimeSlot, MenuCategory, MenuItem, MenuItemOption, Reservation,
)

from .auth import issue_token
from .models import Customer, EmailOTP, Order

NZ = pytz.timezone('Pacific/Auckland')
# A fixed "now": Monday 12 Oct 2026, 12:00 in Auckland.
FIXED_NOW = NZ.localize(datetime(2026, 10, 12, 12, 0))

STRIPE = dict(STRIPE_SECRET_KEY='sk_test_dummy', STRIPE_WEBHOOK_SECRET='whsec_dummy')
NO_STRIPE = dict(STRIPE_SECRET_KEY='', STRIPE_WEBHOOK_SECRET='')


class OrderTestBase(APITestCase):
    def setUp(self):
        self.branch = Branch.objects.create(
            name='Khanz Test', slug='khanz-test', code='TEST', address='1 Queen St', phone='09 000',
            email='kitchen@khanz.test', hours='Daily', min_advance_minutes=0, pickup_prep_minutes=25,
        )
        for day in range(7):
            for hour in range(11, 22):
                BranchTimeSlot.objects.create(branch=self.branch, day_of_week=day, start_time=time(hour, 0), capacity=20)
        mains = MenuCategory.objects.create(name='Mains', slug='mains')
        sides = MenuCategory.objects.create(name='Sides', slug='sides', suggest_at_checkout=True)
        self.curry = MenuItem.objects.create(category=mains, code='M1', name='Butter Chicken', price=Decimal('26.99'))
        self.lamb = MenuItemOption.objects.create(item=self.curry, name='Add lamb', additional_price=Decimal('6.00'))
        self.naan = MenuItem.objects.create(category=sides, code='S1', name='Butter Naan', price=Decimal('3.99'))
        self.other_option = MenuItemOption.objects.create(item=self.naan, name='Garlic', additional_price=Decimal('1.00'))

    def items(self):
        return [
            {'menu_item_id': self.curry.id, 'quantity': 2, 'option_ids': [self.lamb.id], 'notes': 'mild'},
            {'menu_item_id': self.naan.id, 'quantity': 3},
        ]

    def customer_headers(self, email='aroha@example.nz'):
        customer, _ = Customer.objects.get_or_create(email=email)
        return {'HTTP_AUTHORIZATION': f'Customer {issue_token(customer)}'}


@override_settings(DEBUG=True, EMAIL_BACKEND='django.core.mail.backends.console.EmailBackend')
class EmailCodeTests(OrderTestBase):
    def test_request_and_verify_code_returns_token(self):
        sent = self.client.post(reverse('otp-request'), {'email': 'Aroha@Example.nz'}, format='json')
        self.assertEqual(sent.status_code, 200)
        code = sent.data['debug_code']
        wrong = self.client.post(reverse('otp-verify'), {'email': 'aroha@example.nz', 'code': '000000' if code != '000000' else '111111'}, format='json')
        self.assertEqual(wrong.status_code, 400)
        ok = self.client.post(reverse('otp-verify'), {'email': 'aroha@example.nz', 'code': code}, format='json')
        self.assertEqual(ok.status_code, 200)
        self.assertTrue(ok.data['token'])
        me = self.client.get(reverse('customer-me'), HTTP_AUTHORIZATION=f"Customer {ok.data['token']}")
        self.assertEqual(me.data['customer']['email'], 'aroha@example.nz')
        # A code works only once.
        again = self.client.post(reverse('otp-verify'), {'email': 'aroha@example.nz', 'code': code}, format='json')
        self.assertEqual(again.status_code, 400)

    def test_resend_is_rate_limited_and_attempts_capped(self):
        self.client.post(reverse('otp-request'), {'email': 'a@b.nz'}, format='json')
        self.assertEqual(self.client.post(reverse('otp-request'), {'email': 'a@b.nz'}, format='json').status_code, 429)
        for _ in range(5):
            self.client.post(reverse('otp-verify'), {'email': 'a@b.nz', 'code': 'xxxxxx'}, format='json')
        self.assertEqual(self.client.post(reverse('otp-verify'), {'email': 'a@b.nz', 'code': 'xxxxxx'}, format='json').status_code, 429)

    @override_settings(DEBUG=False)
    def test_code_is_never_returned_outside_local_debug(self):
        sent = self.client.post(reverse('otp-request'), {'email': 'c@d.nz'}, format='json')
        self.assertNotIn('debug_code', sent.data)
        self.assertEqual(EmailOTP.objects.filter(email='c@d.nz').count(), 1)

    def test_bad_token_is_rejected(self):
        self.assertEqual(self.client.get(reverse('customer-me'), HTTP_AUTHORIZATION='Customer forged').status_code, 401)


class PricingTests(OrderTestBase):
    def test_quote_prices_options_and_card_fee_server_side(self):
        response = self.client.post(reverse('order-quote'), {'branch': self.branch.slug, 'items': self.items()}, format='json')
        self.assertEqual(response.status_code, 200, response.data)
        # 2 x (26.99 + 6.00) + 3 x 3.99 = 65.98 + 11.97 = 77.95; 2.5% = 1.94875 -> 1.95
        self.assertEqual(response.data['subtotal'], '77.95')
        self.assertEqual(response.data['card_fee'], '1.95')
        self.assertEqual(response.data['total'], '79.90')
        self.assertEqual(response.data['lines'][0]['unit_price'], '32.99')

    @override_settings(CARD_FEE_PERCENT='0')
    def test_fee_percent_is_configurable(self):
        response = self.client.post(reverse('order-quote'), {'branch': self.branch.slug, 'items': self.items()}, format='json')
        self.assertEqual(response.data['card_fee'], '0.00')

    def test_rejects_unavailable_items_and_foreign_options(self):
        self.naan.is_active = False
        self.naan.save()
        response = self.client.post(reverse('order-quote'), {'branch': self.branch.slug, 'items': self.items()}, format='json')
        self.assertEqual(response.status_code, 400)
        foreign = [{'menu_item_id': self.curry.id, 'quantity': 1, 'option_ids': [self.other_option.id]}]
        response = self.client.post(reverse('order-quote'), {'branch': self.branch.slug, 'items': foreign}, format='json')
        self.assertEqual(response.status_code, 400)
        too_many = [{'menu_item_id': self.curry.id, 'quantity': 0}]
        self.assertEqual(self.client.post(reverse('order-quote'), {'branch': self.branch.slug, 'items': too_many}, format='json').status_code, 400)


@mock.patch('django.utils.timezone.now', return_value=FIXED_NOW)
class PickupOrderTests(OrderTestBase):
    def test_pickup_times_offer_asap_and_15_minute_slots(self, _now):
        response = self.client.get(reverse('pickup-times'), {'branch': self.branch.slug})
        self.assertTrue(response.data['asap']['available'])
        today = response.data['days'][0]
        self.assertTrue(today['label'].startswith('Today'))
        self.assertEqual(today['times'][0], NZ.localize(datetime(2026, 10, 12, 12, 30)).isoformat())
        self.assertEqual(len(response.data['days']), 2)

    def test_order_requires_verified_email(self, _now):
        response = self.client.post(reverse('order-create'), {'branch': self.branch.slug, 'items': self.items()}, format='json')
        self.assertEqual(response.status_code, 401)

    @override_settings(**STRIPE)
    def test_create_order_with_scheduled_pickup(self, _now):
        times = self.client.get(reverse('pickup-times'), {'branch': self.branch.slug}).data
        slot = times['days'][0]['times'][2]
        response = self.client.post(reverse('order-create'), {
            'branch': self.branch.slug, 'items': self.items(), 'name': 'Aroha', 'phone': '021 555',
            'pickup': slot, 'notes': 'Extra napkins',
        }, format='json', **self.customer_headers())
        self.assertEqual(response.status_code, 201, response.data)
        order = Order.objects.get(reference=response.data['reference'])
        self.assertEqual(order.total, Decimal('79.90'))
        self.assertEqual(order.status, 'awaiting_payment')
        self.assertFalse(order.pickup_asap)
        self.assertEqual(order.items.count(), 2)
        self.assertEqual(Customer.objects.get(email='aroha@example.nz').name, 'Aroha')

    @override_settings(**STRIPE)
    def test_rejects_pickup_time_outside_opening_hours(self, _now):
        response = self.client.post(reverse('order-create'), {
            'branch': self.branch.slug, 'items': self.items(), 'name': 'A', 'phone': '1',
            'pickup': NZ.localize(datetime(2026, 10, 12, 23, 45)).isoformat(),
        }, format='json', **self.customer_headers())
        self.assertEqual(response.status_code, 400)
        self.assertIn('pickup', response.data)

    @override_settings(**NO_STRIPE)
    def test_no_order_without_stripe(self, _now):
        response = self.client.post(reverse('order-create'), {
            'branch': self.branch.slug, 'items': self.items(), 'name': 'A', 'phone': '1', 'pickup': 'asap',
        }, format='json', **self.customer_headers())
        self.assertEqual(response.status_code, 503)

    @override_settings(**STRIPE)
    def test_checkout_charges_food_plus_fee_and_webhooks_update_order(self, _now):
        created = self.client.post(reverse('order-create'), {
            'branch': self.branch.slug, 'items': self.items(), 'name': 'Aroha', 'phone': '021', 'pickup': 'asap',
        }, format='json', **self.customer_headers()).data
        session = mock.Mock(id='cs_order_1', url='https://checkout.stripe.test/cs_order_1')
        with mock.patch('stripe.checkout.Session.create', return_value=session) as create:
            response = self.client.post(reverse('order-checkout', kwargs={'reference': created['reference']}),
                                        {'email': 'aroha@example.nz'}, format='json')
        self.assertEqual(response.status_code, 200, response.data)
        kwargs = create.call_args.kwargs
        amounts = [(li['price_data']['unit_amount'], li['quantity']) for li in kwargs['line_items']]
        self.assertEqual(amounts, [(3299, 2), (399, 3), (195, 1)])
        self.assertEqual(sum(a * q for a, q in amounts), 7990)
        self.assertIn('/order/', kwargs['success_url'])

        order = Order.objects.get(reference=created['reference'])
        event = {'type': 'checkout.session.completed', 'data': {'object': {
            'id': 'cs_order_1', 'payment_status': 'paid', 'payment_intent': 'pi_1',
            'metadata': {'order_id': str(order.id)}}}}
        with mock.patch('stripe.Webhook.construct_event', return_value=event):
            self.client.post(reverse('stripe-webhook'), data=b'{}', content_type='application/json')
        order.refresh_from_db()
        self.assertEqual((order.payment_status, order.status), ('paid', 'confirmed'))

    def test_other_people_cannot_view_an_order(self, _now):
        order = Order.objects.create(branch=self.branch, name='A', email='owner@x.nz', phone='1')
        url = reverse('order-detail', kwargs={'reference': order.reference})
        self.assertEqual(self.client.get(url, {'email': 'someone@else.nz'}).status_code, 404)
        self.assertEqual(self.client.get(url, {'email': 'OWNER@x.nz'}).status_code, 200)


@override_settings(**STRIPE)
class ReservationPreorderTests(OrderTestBase):
    def booking(self, **extra):
        day = timezone.localdate() + timedelta(days=2)
        slot = BranchTimeSlot.objects.get(branch=self.branch, day_of_week=day.weekday(), start_time=time(19, 0))
        payload = {
            'name': 'Aroha', 'email': 'aroha@example.nz', 'phone': '021', 'branch_slug': self.branch.slug,
            'date': day.isoformat(), 'time_slot_id': slot.id, 'adult_guests': 4, 'child_guests': 0, **extra,
        }
        return self.client.post(reverse('reservation-list'), payload, format='json'), slot, day

    def test_booking_without_dishes_is_free(self):
        response, _, _ = self.booking()
        self.assertEqual(response.status_code, 201, response.data)
        booking = Reservation.objects.get(pk=response.data['id'])
        self.assertEqual((booking.status, booking.payment_status), ('pending', 'not_required'))
        self.assertIsNone(response.data['preorder'])
        self.assertFalse(booking.deposit_required)

    def test_preorder_holds_table_until_paid_then_confirms(self):
        response, _, _ = self.booking(preorder_items=self.items())
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(response.data['preorder']['total'], '79.90')
        booking = Reservation.objects.get(pk=response.data['id'])
        self.assertEqual(booking.status, 'payment_pending')
        session = mock.Mock(id='cs_pre_1', url='https://checkout.stripe.test/cs_pre_1')
        with mock.patch('stripe.checkout.Session.create', return_value=session) as create:
            pay = self.client.post(reverse('reservation-checkout-session', kwargs={'pk': booking.id}),
                                   {'email': 'aroha@example.nz'}, format='json')
        self.assertEqual(pay.status_code, 200, pay.data)
        self.assertIn('/reservation?payment=success', create.call_args.kwargs['success_url'])
        event = {'type': 'checkout.session.completed', 'data': {'object': {
            'id': 'cs_pre_1', 'payment_status': 'paid', 'metadata': {'order_id': str(booking.preorder.id)}}}}
        with mock.patch('stripe.Webhook.construct_event', return_value=event):
            self.client.post(reverse('stripe-webhook'), data=b'{}', content_type='application/json')
        booking.refresh_from_db()
        self.assertEqual((booking.status, booking.payment_status), ('confirmed', 'paid'))

    def test_expired_preorder_payment_releases_the_table(self):
        response, slot, day = self.booking(preorder_items=self.items())
        booking = Reservation.objects.get(pk=response.data['id'])
        event = {'type': 'checkout.session.expired', 'data': {'object': {
            'id': 'cs_x', 'metadata': {'order_id': str(booking.preorder.id)}}}}
        with mock.patch('stripe.Webhook.construct_event', return_value=event):
            self.client.post(reverse('stripe-webhook'), data=b'{}', content_type='application/json')
        booking.refresh_from_db()
        self.assertEqual(booking.status, 'cancelled')
        availability = self.client.get(reverse('reservation-availability'),
                                       {'branch': self.branch.slug, 'date': day.isoformat(), 'guests': 1})
        self.assertEqual(next(s for s in availability.data['slots'] if s['id'] == slot.id)['remaining_capacity'], 20)

    @override_settings(**NO_STRIPE)
    def test_preorder_needs_stripe(self):
        response, _, _ = self.booking(preorder_items=self.items())
        self.assertEqual(response.status_code, 400)
        self.assertFalse(Reservation.objects.exists())


from .models import Promotion  # noqa: E402


@mock.patch('django.utils.timezone.now', return_value=FIXED_NOW)
class PromotionTests(OrderTestBase):
    def promo(self, **extra):
        data = dict(
            title='Weekend feast', discount_type='percent', discount_value=Decimal('10'),
            min_subtotal=Decimal('50'), starts_at=FIXED_NOW - timedelta(hours=1), ends_at=FIXED_NOW + timedelta(days=1),
        )
        data.update(extra)
        return Promotion.objects.create(**data)

    def quote(self, kind='pickup', items=None):
        return self.client.post(reverse('order-quote'), {'branch': self.branch.slug, 'items': items or self.items(), 'kind': kind}, format='json').data

    def test_live_promotion_discounts_before_card_fee(self, _now):
        self.promo()
        data = self.quote()
        # 77.95 - 10% (7.80) = 70.15; fee 2.5% = 1.75; total 71.90
        self.assertEqual((data['discount'], data['card_fee'], data['total']), ('7.80', '1.75', '71.90'))
        self.assertEqual(data['promotion']['badge'], '10% OFF')

    def test_inactive_scheduled_expired_or_below_minimum_do_not_apply(self, _now):
        self.promo(starts_at=FIXED_NOW + timedelta(hours=1))
        self.promo(ends_at=FIXED_NOW - timedelta(minutes=1), starts_at=FIXED_NOW - timedelta(days=2))
        self.promo(is_active=False)
        self.promo(min_subtotal=Decimal('100'))
        data = self.quote()
        self.assertEqual(data['discount'], '0.00')
        self.assertIsNone(data['promotion'])

    def test_promotion_scope_and_best_discount(self, _now):
        self.promo(title='Pre-order only', applies_to='preorder', discount_value=Decimal('50'))
        self.promo(title='Five off', discount_type='fixed', discount_value=Decimal('5'))
        self.assertEqual(self.quote()['promotion']['title'], 'Five off')
        self.assertEqual(self.quote('preorder')['promotion']['title'], 'Pre-order only')

    def test_live_endpoint_respects_dates_and_placement(self, _now):
        self.promo(title='Live everywhere')
        self.promo(title='Checkout only', show_on_home=False)
        self.promo(title='Next week', starts_at=FIXED_NOW + timedelta(days=7), ends_at=FIXED_NOW + timedelta(days=8))
        home = [p['title'] for p in self.client.get(reverse('promotions-live'), {'placement': 'home'}).data]
        checkout = [p['title'] for p in self.client.get(reverse('promotions-live'), {'placement': 'checkout'}).data]
        self.assertEqual(sorted(home), ['Live everywhere'])
        self.assertEqual(sorted(checkout), ['Checkout only', 'Live everywhere'])

    @override_settings(**STRIPE)
    def test_order_stores_discount_and_stripe_gets_coupon(self, _now):
        promo = self.promo()
        created = self.client.post(reverse('order-create'), {
            'branch': self.branch.slug, 'items': self.items(), 'name': 'A', 'phone': '1', 'pickup': 'asap',
        }, format='json', **self.customer_headers()).data
        order = Order.objects.get(reference=created['reference'])
        self.assertEqual((order.promotion, order.discount, order.total), (promo, Decimal('7.80'), Decimal('71.90')))
        session = mock.Mock(id='cs_promo', url='https://checkout.stripe.test/cs_promo')
        with mock.patch('stripe.Coupon.create', return_value=mock.Mock(id='co_1')) as coupon, \
                mock.patch('stripe.checkout.Session.create', return_value=session) as create:
            self.client.post(reverse('order-checkout', kwargs={'reference': order.reference}), {'email': 'aroha@example.nz'}, format='json')
        self.assertEqual(coupon.call_args.kwargs['amount_off'], 780)
        kwargs = create.call_args.kwargs
        self.assertEqual(kwargs['discounts'], [{'coupon': 'co_1'}])
        charged = sum(li['price_data']['unit_amount'] * li['quantity'] for li in kwargs['line_items']) - 780
        self.assertEqual(charged, 7190)

    @override_settings(**STRIPE)
    def test_reservation_preorder_gets_preorder_promotion(self, _now):
        self.promo(applies_to='preorder', discount_type='fixed', discount_value=Decimal('5'), min_subtotal=Decimal('0'))
        day = FIXED_NOW.date() + timedelta(days=2)
        slot = BranchTimeSlot.objects.get(branch=self.branch, day_of_week=day.weekday(), start_time=time(19, 0))
        response = self.client.post(reverse('reservation-list'), {
            'name': 'A', 'email': 'a@b.nz', 'phone': '1', 'branch_slug': self.branch.slug, 'date': day.isoformat(),
            'time_slot_id': slot.id, 'adult_guests': 2, 'child_guests': 0, 'preorder_items': self.items(),
        }, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(response.data['preorder']['discount'], '5.00')


@mock.patch('django.utils.timezone.now', return_value=FIXED_NOW)
@override_settings(**STRIPE)
class GuestCheckoutTests(OrderTestBase):
    def guest_order(self, **extra):
        return self.client.post(reverse('order-create'), {
            'branch': self.branch.slug, 'items': self.items(), 'name': 'Walk-in Test', 'phone': '021 000',
            'pickup': 'asap', 'guest': True, **extra,
        }, format='json')

    def test_guest_can_order_with_name_and_phone_only(self, _now):
        response = self.guest_order()
        self.assertEqual(response.status_code, 201, response.data)
        order = Order.objects.get(reference=response.data['reference'])
        self.assertTrue(order.is_guest)
        self.assertIsNone(order.customer)
        self.assertEqual(order.email, '')
        token = response.data['access_token']
        detail = reverse('order-detail', kwargs={'reference': order.reference})
        self.assertEqual(self.client.get(detail, HTTP_AUTHORIZATION=f'Order {token}').status_code, 200)
        self.assertEqual(self.client.get(detail).status_code, 404)
        # A token for one order cannot open another.
        other = self.guest_order().data['reference']
        self.assertEqual(self.client.get(reverse('order-detail', kwargs={'reference': other}), HTTP_AUTHORIZATION=f'Order {token}').status_code, 404)
        session = mock.Mock(id='cs_guest', url='https://checkout.stripe.test/cs_guest')
        with mock.patch('stripe.checkout.Session.create', return_value=session) as create:
            pay = self.client.post(reverse('order-checkout', kwargs={'reference': order.reference}), {}, format='json', HTTP_AUTHORIZATION=f'Order {token}')
        self.assertEqual(pay.status_code, 200)
        self.assertNotIn('customer_email', create.call_args.kwargs)

    def test_guest_needs_name_phone_and_valid_optional_email(self, _now):
        self.assertEqual(self.guest_order(phone='').status_code, 400)
        self.assertEqual(self.guest_order(email='not-an-email').status_code, 400)
        ok = self.guest_order(email='Guest@Example.nz')
        self.assertEqual(Order.objects.get(reference=ok.data['reference']).email, 'guest@example.nz')

    @override_settings(GUEST_CHECKOUT_ENABLED=False)
    def test_guest_checkout_can_be_switched_off(self, _now):
        self.assertEqual(self.guest_order().status_code, 401)


@override_settings(**STRIPE)
class StripeSyncTests(OrderTestBase):
    def test_returning_customer_confirms_order_without_webhook(self):
        order = Order.objects.create(branch=self.branch, name='A', email='a@b.nz', phone='1',
                                     stripe_checkout_session_id='cs_sync', total=Decimal('10.00'))
        url = reverse('order-detail', kwargs={'reference': order.reference})
        unpaid = {'payment_status': 'unpaid', 'payment_intent': None}
        with mock.patch('stripe.checkout.Session.retrieve', return_value=unpaid):
            self.assertEqual(self.client.get(url, {'email': 'a@b.nz', 'sync': '1'}).data['payment_status'], 'unpaid')
        with mock.patch('stripe.checkout.Session.retrieve', return_value={'payment_status': 'paid', 'payment_intent': 'pi_9'}) as retrieve:
            data = self.client.get(url, {'email': 'a@b.nz', 'sync': '1'}).data
        self.assertEqual((data['payment_status'], data['status']), ('paid', 'confirmed'))
        retrieve.assert_called_once_with('cs_sync')
        with mock.patch('stripe.checkout.Session.retrieve') as again:
            self.client.get(url, {'email': 'a@b.nz', 'sync': '1'})
        again.assert_not_called()  # already paid: no more Stripe calls


from django.contrib.auth import get_user_model  # noqa: E402


@override_settings(**STRIPE)
class StaffDashboardTests(OrderTestBase):
    def setUp(self):
        super().setUp()
        User = get_user_model()
        self.staff = User.objects.create_user('manager', password='Strong-pass-123', is_staff=True)
        User.objects.create_user('cook', password='Strong-pass-123', is_staff=False)

    def login(self, username='manager', password='Strong-pass-123'):
        return self.client.post(reverse('staff-login'), {'username': username, 'password': password}, format='json')

    def auth(self):
        return {'HTTP_AUTHORIZATION': f"Staff {self.login().data['token']}"}

    def test_only_staff_can_sign_in(self):
        self.assertEqual(self.login().status_code, 200)
        self.assertEqual(self.login(password='wrong').status_code, 400)
        self.assertEqual(self.login(username='cook').status_code, 400)

    def test_endpoints_require_staff_token(self):
        self.assertIn(self.client.get(reverse('staff-overview')).status_code, (401, 403))
        self.assertEqual(self.client.get(reverse('staff-overview'), HTTP_AUTHORIZATION='Staff forged').status_code, 401)
        self.assertEqual(self.client.get(reverse('staff-overview'), **self.auth()).status_code, 200)

    def test_password_change_invalidates_token(self):
        headers = self.auth()
        self.staff.set_password('Another-pass-456')
        self.staff.save()
        self.assertEqual(self.client.get(reverse('staff-me'), **headers).status_code, 401)

    def test_staff_token_unlocks_existing_reservation_admin_endpoints(self):
        self.assertEqual(self.client.get(reverse('reservation-list'), **self.auth()).status_code, 200)

    def test_order_queue_and_status_flow(self):
        order = Order.objects.create(branch=self.branch, name='A', phone='1', status='confirmed', payment_status='paid',
                                     total=Decimal('20.00'), paid_at=timezone.now(), pickup_at=timezone.now())
        headers = self.auth()
        queue = self.client.get(reverse('staff-orders'), **headers).data
        self.assertEqual([o['reference'] for o in queue], [order.reference])
        url = reverse('staff-order-status', kwargs={'reference': order.reference})
        self.assertEqual(self.client.patch(url, {'status': 'collected'}, format='json', **headers).status_code, 400)
        for step in ['preparing', 'ready', 'collected']:
            self.assertEqual(self.client.patch(url, {'status': step}, format='json', **headers).status_code, 200)
        self.assertEqual(self.client.get(reverse('staff-orders'), **headers).data, [])
        overview = self.client.get(reverse('staff-overview'), **headers).data
        self.assertEqual(overview['stats']['orders_today'], 1)
        sales = self.client.get(reverse('staff-sales'), {'days': 7}, **headers).data
        self.assertEqual(sales['totals']['revenue'], '20.00')
        self.assertEqual(len(sales['series']), 7)

    def test_menu_toggle_and_price_edit(self):
        headers = self.auth()
        url = reverse('staff-menu-item', kwargs={'pk': self.naan.id})
        self.assertEqual(self.client.patch(url, {'is_active': False, 'price': '4.50'}, format='json', **headers).status_code, 200)
        self.naan.refresh_from_db()
        self.assertEqual((self.naan.is_active, self.naan.price), (False, Decimal('4.50')))
        self.assertEqual(self.client.patch(url, {'price': '-1'}, format='json', **headers).status_code, 400)
        menu = self.client.get(reverse('staff-menu'), **headers).data
        self.assertTrue(any(i['id'] == self.naan.id for c in menu for i in c['items']))

    def test_customers_and_promotions_lists(self):
        Order.objects.create(branch=self.branch, name='Aroha', email='a@b.nz', phone='1', payment_status='paid', total=Decimal('30'))
        Order.objects.create(branch=self.branch, name='Aroha', email='A@B.nz', phone='1', payment_status='paid', total=Decimal('10'))
        headers = self.auth()
        customers = self.client.get(reverse('staff-customers'), **headers).data
        self.assertEqual(customers['results'][0]['orders'], 2)
        self.assertEqual(customers['results'][0]['spend'], '40.00')
        self.assertEqual(self.client.get(reverse('staff-promotions'), **headers).status_code, 200)
