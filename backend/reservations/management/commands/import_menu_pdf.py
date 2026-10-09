from datetime import date
from pathlib import Path

from django.core.files import File
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from reservations.models import Branch, MenuDocument


class Command(BaseCommand):
    help = 'Import or update a versioned menu PDF in Django file storage.'

    def add_arguments(self, parser):
        parser.add_argument('path', help='Path to the PDF file')
        parser.add_argument('--title', default='Khanz Restaurant Menu')
        parser.add_argument('--menu-version', required=True)
        parser.add_argument('--branch', help='Branch slug; omit for a group-wide menu')
        parser.add_argument('--effective-from', default=date.today().isoformat())
        parser.add_argument('--page-count', type=int)
        parser.add_argument('--keep-older-active', action='store_true')

    @transaction.atomic
    def handle(self, *args, **options):
        source = Path(options['path']).expanduser().resolve()
        if not source.is_file() or source.suffix.lower() != '.pdf':
            raise CommandError(f'PDF not found: {source}')

        branch = None
        if options['branch']:
            try:
                branch = Branch.objects.get(slug=options['branch'])
            except Branch.DoesNotExist as exc:
                raise CommandError(f"Unknown branch slug: {options['branch']}") from exc

        if not options['keep_older_active']:
            MenuDocument.objects.filter(branch=branch, is_active=True).update(is_active=False)

        menu, _ = MenuDocument.objects.get_or_create(
            branch=branch,
            version=options['menu_version'],
            defaults={
                'title': options['title'],
                'effective_from': options['effective_from'],
                'page_count': options['page_count'],
                'is_active': True,
                'is_public': True,
            },
        )
        menu.title = options['title']
        menu.effective_from = options['effective_from']
        menu.page_count = options['page_count']
        menu.is_active = True
        menu.is_public = True
        menu.original_filename = source.name
        menu.checksum_sha256 = ''
        with source.open('rb') as stream:
            menu.file.save(source.name, File(stream), save=False)
        menu.save()

        self.stdout.write(self.style.SUCCESS(
            f'Imported {source.name} as menu #{menu.pk} ({menu.version}); '
            f'{menu.file_size} bytes, sha256={menu.checksum_sha256[:12]}...'
        ))
