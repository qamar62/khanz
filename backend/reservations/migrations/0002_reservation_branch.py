# Generated migration for adding branch field to Reservation model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reservations', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='reservation',
            name='branch',
            field=models.CharField(blank=True, default='', max_length=100),
        ),
    ]
