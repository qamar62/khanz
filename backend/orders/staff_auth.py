"""Staff token authentication (kept free of view imports: it is loaded from DRF settings)."""
from django.contrib.auth import get_user_model
from django.core import signing
from rest_framework import exceptions
from rest_framework.authentication import BaseAuthentication

STAFF_SALT = 'khanz.staff'
STAFF_TOKEN_MAX_AGE = 60 * 60 * 12  # one shift


def issue_staff_token(user):
    return signing.TimestampSigner(salt=STAFF_SALT).sign(f'{user.pk}:{user.password[-12:]}')


class StaffTokenAuthentication(BaseAuthentication):
    """Accepts ``Authorization: Staff <token>``. Changing the password invalidates old tokens."""

    keyword = 'Staff'

    def authenticate(self, request):
        header = request.META.get('HTTP_AUTHORIZATION', '')
        if not header.startswith(f'{self.keyword} '):
            return None
        try:
            value = signing.TimestampSigner(salt=STAFF_SALT).unsign(
                header[len(self.keyword) + 1:].strip(), max_age=STAFF_TOKEN_MAX_AGE,
            )
            user_id, fingerprint = value.split(':', 1)
        except (signing.BadSignature, ValueError):
            raise exceptions.AuthenticationFailed('Your session has expired. Please sign in again.')
        user = get_user_model().objects.filter(pk=user_id, is_active=True, is_staff=True).first()
        if not user or user.password[-12:] != fingerprint:
            raise exceptions.AuthenticationFailed('Your session has expired. Please sign in again.')
        return user, None

    def authenticate_header(self, request):
        return self.keyword
