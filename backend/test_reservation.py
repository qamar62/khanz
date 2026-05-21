import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'khanz_backend.settings')
django.setup()

from datetime import date, time
from reservations.models import Reservation
from reservations.utils.google_calendar import create_calendar_event

# Create a test reservation
reservation = Reservation.objects.create(
    name="Test Customer",
    email="hzcuisinelimited@gmail.com",
    phone="+64 9 250 1919",
    date=date(2025, 5, 25),  # May 25, 2025
    time=time(19, 0),  # 7:00 PM
    guests=4,
    occasion="birthday",
    special_requests="Window seat please, celebrating birthday!",
    status="confirmed"
)

print(f"✅ Reservation created: ID {reservation.id}")
print(f"   Name: {reservation.name}")
print(f"   Date: {reservation.date}")
print(f"   Time: {reservation.time}")
print(f"   Guests: {reservation.guests}")

# Create Google Calendar event
try:
    event_id = create_calendar_event(reservation)
    reservation.google_calendar_event_id = event_id
    reservation.save()
    print(f"\n🎉 SUCCESS! Google Calendar event created!")
    print(f"   Event ID: {event_id}")
    print(f"\n📅 Check your Google Calendar at: https://calendar.google.com")
    print(f"   Look for: 'Table Reservation - Test Customer (4 guests)'")
    print(f"   Date: May 25, 2025 at 7:00 PM")
except Exception as e:
    print(f"\n❌ Error creating calendar event: {e}")
