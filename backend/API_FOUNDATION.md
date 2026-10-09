# Khanz booking and menu API foundation

The backend is branch-aware and designed to be shared by the website, the future dashboard, and mobile clients.

## Core records

- `Branch`: operating rules, capacity, booking window, deposit policy, currency, and Stripe account reference per location.
- `Reservation`: public reference, source channel, lifecycle status, payment status, allocated tables, arrival timestamps, and internal notes.
- `RestaurantTable`: named physical tables with areas and capacity.
- `Payment`: Stripe identifiers, idempotency key, amount, lifecycle, and failure details. Card details are never stored.
- `ReservationEvent`: append-only operational audit history.
- `BranchTimeSlot`: recurring weekday/start-time capacity owned by one branch. Capacity is people, not tables.
- `MenuCategory`, `MenuItem`, and `MenuItemOption`: normalized menu data shared by web and mobile clients, with optional branch targeting.
- `MenuDocument`: optional source/archive documents for staff use; the public menu is served from normalized item data.

## Seed the initial menu

From `backend/`:

```powershell
python manage.py seed_menu
```

The first run creates the 8 categories and 82 items transcribed from the August menu. Later runs do nothing, protecting manual admin changes. Afterwards, staff can edit prices, descriptions, availability, branch targeting and options in Django admin. Use `--force` only when you intentionally want the seed file to overwrite seeded fields; combine it with `--deactivate-missing` only when the seed is the authoritative complete list.

## Capacity accounting

Each branch manages its own weekday time slots and per-slot people capacity. Availability is derived from the sum of `guests` on non-cancelled reservations for that exact slot and date. `guests` is always recalculated as `adult_guests + child_guests`; children consume capacity exactly like adults. Remaining capacity is not stored, so edits and cancellations are reflected immediately without a stale counter. Booking writes lock the slot row transactionally to prevent two simultaneous customers from overselling it.

## Public API

- `GET /api/branches/`
- `GET /api/menus/`
- `GET /api/reservations/availability/?branch=<slug>&date=YYYY-MM-DD&guests=N`
- `POST /api/reservations/`
- `POST /api/reservations/<id>/checkout-session/`
- `POST /api/payments/stripe/webhook/`

Reservation lists, customer details, table allocation, events, status transitions, and dashboard summaries require staff authentication.

## Stripe test setup

Add `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, and `STRIPE_WEBHOOK_SECRET` to the backend environment. Use Stripe test-mode values. Point the Stripe webhook at `/api/payments/stripe/webhook/`; the signature secret is mandatory. The website stores a reservation first, then creates a hosted Checkout Session only when a deposit is required.

Before production, move menu media to durable object storage, use PostgreSQL, terminate TLS at the proxy, and create separate staff roles for branch managers and group administrators.
