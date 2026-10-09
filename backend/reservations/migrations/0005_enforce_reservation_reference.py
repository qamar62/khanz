from django.db import migrations, models

import reservations.models


class Migration(migrations.Migration):
    dependencies = [
        ('reservations', '0004_seed_branches_and_link_reservations'),
    ]

    operations = [
        migrations.AlterField(
            model_name='reservation',
            name='reference',
            field=models.CharField(
                db_index=True,
                default=reservations.models.generate_reservation_reference,
                editable=False,
                max_length=16,
                unique=True,
            ),
        ),
    ]
