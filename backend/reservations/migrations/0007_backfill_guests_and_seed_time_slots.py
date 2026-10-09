from datetime import datetime, timedelta

from django.db import migrations


def forwards(apps, schema_editor):
    Reservation = apps.get_model('reservations', 'Reservation')
    Branch = apps.get_model('reservations', 'Branch')
    BranchTimeSlot = apps.get_model('reservations', 'BranchTimeSlot')

    for reservation in Reservation.objects.all().iterator():
        reservation.adult_guests = reservation.guests
        reservation.child_guests = 0
        reservation.save(update_fields=['adult_guests', 'child_guests'])

    for branch in Branch.objects.filter(is_active=True, booking_enabled=True):
        interval = max(branch.booking_interval_minutes, 15)
        for day_of_week in range(7):
            cursor = datetime(2000, 1, 1, 11, 30)
            closes = datetime(2000, 1, 1, 21, 0)
            order = 0
            while cursor <= closes:
                BranchTimeSlot.objects.get_or_create(
                    branch=branch,
                    day_of_week=day_of_week,
                    start_time=cursor.time(),
                    defaults={'capacity': branch.online_capacity, 'sort_order': order},
                )
                cursor += timedelta(minutes=interval)
                order += 1

    for reservation in Reservation.objects.exclude(branch_location=None).iterator():
        reservation.time_slot = BranchTimeSlot.objects.filter(
            branch=reservation.branch_location,
            day_of_week=reservation.date.weekday(),
            start_time=reservation.time,
        ).first()
        if reservation.time_slot_id:
            reservation.save(update_fields=['time_slot'])


def backwards(apps, schema_editor):
    BranchTimeSlot = apps.get_model('reservations', 'BranchTimeSlot')
    BranchTimeSlot.objects.all().delete()


class Migration(migrations.Migration):
    dependencies = [('reservations', '0006_menucategory_reservation_adult_guests_and_more')]
    operations = [migrations.RunPython(forwards, backwards)]
