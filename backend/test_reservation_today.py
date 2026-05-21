import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'khanz_backend.settings')
django.setup()

from datetime import date, time, timedelta
from reservations.models import Reservation
from reservations.utils.google_calendar import create_calendar_event

# Create a test reservation for TOMORROW (so you can see it in current calendar view)
tomorrow = date.today() + timedelta(days=1)

# Create a test reservation
reservation = Reservation.objects.create(
    name="John Doe - Test Booking",
    email="hzcuisinelimited@gmail.com",
    phone="+64 9 250 1919",
    date=tomorrow,
    time=time(18, 30),  # 6:30 PM
    guests=6,
    occasion="anniversary",
    special_requests="Quiet corner table, celebrating 10th anniversary",
    status="confirmed"
)

print(f"✅ Reservation created: ID {reservation.id}")
print(f"   Name: {reservation.name}")
print(f"   Date: {reservation.date} (TOMORROW)")
print(f"   Time: {reservation.time}")
print(f"   Guests: {reservation.guests}")

# Create Google Calendar event
try:
    event_id = create_calendar_event(reservation)
    reservation.google_calendar_event_id = event_id
    reservation.save()
    print(f"\n🎉 SUCCESS! Google Calendar event created!")
    print(f"   Event ID: {event_id}")
    print(f"\n📅 Check your Google Calendar NOW!")
    print(f"   Look for: 'Table Reservation - John Doe - Test Booking (6 guests)'")
    print(f"   Date: {tomorrow.strftime('%A, %B %d, %Y')} (TOMORROW)")
    print(f"   Time: 6:30 PM - 8:30 PM")
    print(f"\n🔗 Direct link: https://calendar.google.com")
except Exception as e:
    print(f"\n❌ Error creating calendar event: {e}")
    import traceback
    traceback.print_exc()
