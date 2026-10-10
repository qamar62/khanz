"""Pickup times derived from each branch's weekly opening slots."""
from datetime import datetime, timedelta

import pytz
from django.utils import timezone

from reservations.models import BranchTimeSlot

STEP_MINUTES = 15
DAYS_AHEAD = 2  # today and tomorrow


def _round_up(moment, minutes=STEP_MINUTES):
    discard = timedelta(minutes=moment.minute % minutes, seconds=moment.second, microseconds=moment.microsecond)
    moment -= discard
    if discard:
        moment += timedelta(minutes=minutes)
    return moment


def opening_window(branch, day, tz):
    """(open, close) local datetimes for a day, from the branch's first and last active slot."""
    starts = list(
        BranchTimeSlot.objects.filter(branch=branch, day_of_week=day.weekday(), is_active=True)
        .values_list('start_time', flat=True)
    )
    if not starts:
        return None
    open_at = tz.localize(datetime.combine(day, min(starts)))
    close_at = tz.localize(datetime.combine(day, max(starts))) + timedelta(minutes=branch.booking_interval_minutes or 30)
    return open_at, close_at


def pickup_options(branch, now=None):
    tz = pytz.timezone(branch.timezone)
    now = (now or timezone.now()).astimezone(tz)
    prep = timedelta(minutes=branch.pickup_prep_minutes)
    earliest = now + prep
    days, asap = [], None
    for offset in range(DAYS_AHEAD):
        day = (now + timedelta(days=offset)).date()
        window = opening_window(branch, day, tz)
        if not window:
            continue
        open_at, close_at = window
        if offset == 0 and open_at <= earliest <= close_at:
            asap = {'available': True, 'ready_at': earliest.isoformat(), 'minutes': branch.pickup_prep_minutes}
        cursor = _round_up(max(open_at, earliest))
        times = []
        while cursor <= close_at:
            times.append(cursor.isoformat())
            cursor += timedelta(minutes=STEP_MINUTES)
        if times:
            label = 'Today' if offset == 0 else 'Tomorrow'
            days.append({'date': day.isoformat(), 'label': f"{label} · {day:%a %d %b}", 'times': times})
    return {
        'asap': asap or {'available': False, 'ready_at': None, 'minutes': branch.pickup_prep_minutes},
        'days': days,
        'timezone': branch.timezone,
    }


def validate_pickup(branch, pickup):
    """Return (asap: bool, pickup_at: datetime) or raise ValueError with a customer-facing message."""
    options = pickup_options(branch)
    if pickup in (None, '', 'asap'):
        if not options['asap']['available']:
            raise ValueError('ASAP pickup is not available right now. Please choose a pickup time.')
        return True, datetime.fromisoformat(options['asap']['ready_at'])
    allowed = {t for day in options['days'] for t in day['times']}
    try:
        requested = datetime.fromisoformat(str(pickup))
    except ValueError:
        raise ValueError('Choose a valid pickup time.')
    if requested.isoformat() not in allowed:
        raise ValueError('That pickup time is no longer available. Please choose another.')
    return False, requested
