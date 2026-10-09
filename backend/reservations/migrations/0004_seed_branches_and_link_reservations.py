import uuid

from django.db import migrations


BRANCHES = [
    {
        'slug': 'khanz-fusion-buffet',
        'code': 'FUSION_PAP',
        'name': 'Khanz Fusion Buffet',
        'address': '38C East Tamaki Road, Papatoetoe, Auckland 2025',
        'phone': '+64 9 250 1919',
        'email': 'info@khanz.co.nz',
        'hours': 'Daily - 11:30 AM - 9:30 PM',
        'is_flagship': True,
        'sort_order': 1,
    },
    {
        'slug': 'khanz-mediterranean',
        'code': 'MEDIT_PAP',
        'name': 'Khanz Mediterranean Restaurant',
        'address': '135 Great South Road, Papatoetoe, Auckland 2025',
        'phone': '+64 9 250 1623',
        'email': 'info@khanz.co.nz',
        'hours': 'Daily - 12:00 PM - 9:00 PM',
        'sort_order': 2,
    },
    {
        'slug': 'khanz-botany',
        'code': 'BOTANY',
        'name': 'Khanz Restaurant Botany',
        'address': '302 Te Irirangi Drive, Flat Bush, Auckland 2013',
        'phone': '+64 9 250 4414',
        'email': 'info@khanz.co.nz',
        'hours': 'Daily - 11:30 AM - 10:00 PM',
        'sort_order': 3,
    },
    {
        'slug': 'khanz-takeaway',
        'code': 'PANMURE',
        'name': 'Khanz Takeaway',
        'address': '10/71 Jellicoe Road, Panmure, Auckland 2025',
        'phone': '+64 9 527 0647',
        'email': 'info@khanz.co.nz',
        'hours': 'Daily - 11:00 AM - 9:00 PM',
        'sort_order': 4,
    },
]


def seed_branches(apps, schema_editor):
    Branch = apps.get_model('reservations', 'Branch')
    Reservation = apps.get_model('reservations', 'Reservation')

    for reservation in Reservation.objects.filter(reference__isnull=True):
        reservation.reference = f"KH{uuid.uuid4().hex[:10].upper()}"
        reservation.save(update_fields=['reference'])

    for index, item in enumerate(BRANCHES):
        branch = Branch.objects.filter(slug=item['slug']).first()
        if not branch:
            branch = Branch.objects.filter(name=item['name']).first()
        if not branch:
            branch = Branch()
        for field, value in item.items():
            setattr(branch, field, value)
        branch.save()

    for reservation in Reservation.objects.filter(branch_location__isnull=True).exclude(branch=''):
        branch = Branch.objects.filter(slug=reservation.branch).first()
        if not branch:
            branch = Branch.objects.filter(name__iexact=reservation.branch).first()
        if branch:
            reservation.branch_location_id = branch.id
            reservation.save(update_fields=['branch_location'])


class Migration(migrations.Migration):
    dependencies = [
        ('reservations', '0003_alter_branch_options_branch_booking_enabled_and_more'),
    ]

    operations = [migrations.RunPython(seed_branches, migrations.RunPython.noop)]
