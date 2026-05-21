from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import Reservation, ContactMessage, CateringRequest, Branch
from .serializers import (
    ReservationSerializer,
    ContactMessageSerializer,
    CateringRequestSerializer,
    BranchSerializer
)
from .utils.google_calendar import create_calendar_event, delete_calendar_event


@method_decorator(csrf_exempt, name='dispatch')
class ReservationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing table reservations
    """
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    
    def create(self, request, *args, **kwargs):
        """Override create to add detailed logging"""
        print("=" * 50)
        print("RESERVATION CREATE REQUEST")
        print("=" * 50)
        print(f"Request data: {request.data}")
        print(f"Content-Type: {request.content_type}")
        
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("VALIDATION ERRORS:")
            print(serializer.errors)
            print("=" * 50)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        print("SUCCESS! Reservation created:")
        print(serializer.data)
        print("=" * 50)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def perform_create(self, serializer):
        """Create reservation and sync with Google Calendar"""
        reservation = serializer.save()
        
        # Create Google Calendar event
        try:
            event_id = create_calendar_event(reservation)
            reservation.google_calendar_event_id = event_id
            reservation.save()
        except Exception as e:
            print(f"Failed to create calendar event: {e}")
        
        # Send confirmation email
        self.send_confirmation_email(reservation)
    
    def perform_destroy(self, instance):
        """Delete reservation and remove from Google Calendar"""
        if instance.google_calendar_event_id:
            try:
                delete_calendar_event(instance.google_calendar_event_id)
            except Exception as e:
                print(f"Failed to delete calendar event: {e}")
        
        instance.delete()
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Confirm a reservation"""
        reservation = self.get_object()
        reservation.status = 'confirmed'
        reservation.save()
        
        # Send confirmation email
        self.send_confirmation_email(reservation)
        
        return Response({'status': 'reservation confirmed'})
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a reservation"""
        reservation = self.get_object()
        reservation.status = 'cancelled'
        reservation.save()
        
        # Remove from Google Calendar
        if reservation.google_calendar_event_id:
            try:
                delete_calendar_event(reservation.google_calendar_event_id)
            except Exception as e:
                print(f"Failed to delete calendar event: {e}")
        
        return Response({'status': 'reservation cancelled'})
    
    def send_confirmation_email(self, reservation):
        """Send confirmation email to customer"""
        subject = f'Reservation Confirmation - Khanz Restaurant'
        message = f"""
Dear {reservation.name},

Thank you for your reservation at Khanz Restaurant!

Reservation Details:
- Date: {reservation.date.strftime('%A, %B %d, %Y')}
- Time: {reservation.time.strftime('%I:%M %p')}
- Guests: {reservation.guests}
- Status: {reservation.get_status_display()}

{f"Occasion: {reservation.get_occasion_display()}" if reservation.occasion != 'none' else ""}
{f"Special Requests: {reservation.special_requests}" if reservation.special_requests else ""}

We look forward to serving you!

Best regards,
Khanz Restaurant Team
        """
        
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [reservation.email],
                fail_silently=True,
            )
        except Exception as e:
            print(f"Failed to send email: {e}")


class ContactMessageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing contact messages
    """
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    
    def perform_create(self, serializer):
        """Create contact message and notify staff"""
        message = serializer.save()
        
        # Send notification to staff
        self.notify_staff(message)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark message as read"""
        message = self.get_object()
        message.status = 'read'
        message.save()
        return Response({'status': 'message marked as read'})
    
    @action(detail=True, methods=['post'])
    def mark_replied(self, request, pk=None):
        """Mark message as replied"""
        message = self.get_object()
        message.status = 'replied'
        message.save()
        return Response({'status': 'message marked as replied'})
    
    def notify_staff(self, message):
        """Send notification email to staff"""
        subject = f'New Contact Message from {message.name}'
        email_message = f"""
New contact message received:

From: {message.name}
Email: {message.email}
Phone: {message.phone or 'Not provided'}

Message:
{message.message}

Received at: {message.created_at.strftime('%Y-%m-%d %H:%M:%S')}
        """
        
        try:
            send_mail(
                subject,
                email_message,
                settings.DEFAULT_FROM_EMAIL,
                [settings.EMAIL_HOST_USER],
                fail_silently=True,
            )
        except Exception as e:
            print(f"Failed to send notification: {e}")


class CateringRequestViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing catering requests
    """
    queryset = CateringRequest.objects.all()
    serializer_class = CateringRequestSerializer
    
    def perform_create(self, serializer):
        """Create catering request and notify staff"""
        request = serializer.save()
        
        # Send notification to staff
        self.notify_staff(request)
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update catering request status"""
        catering_request = self.get_object()
        new_status = request.data.get('status')
        
        if new_status in dict(CateringRequest.STATUS_CHOICES):
            catering_request.status = new_status
            catering_request.save()
            return Response({'status': f'updated to {new_status}'})
        
        return Response(
            {'error': 'Invalid status'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    def notify_staff(self, catering_request):
        """Send notification email to staff"""
        subject = f'New Catering Request from {catering_request.name}'
        message = f"""
New catering request received:

From: {catering_request.name}
Email: {catering_request.email}
Phone: {catering_request.phone}

Event Details:
- Type: {catering_request.get_event_type_display()}
- Date: {catering_request.event_date.strftime('%A, %B %d, %Y')}
- Guest Count: {catering_request.guest_count}
- Venue: {catering_request.venue_address or 'Not provided'}

Message:
{catering_request.message or 'No additional message'}

Received at: {catering_request.created_at.strftime('%Y-%m-%d %H:%M:%S')}
        """
        
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [settings.EMAIL_HOST_USER],
                fail_silently=True,
            )
        except Exception as e:
            print(f"Failed to send notification: {e}")


class BranchViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing branch locations (read-only for API)
    """
    queryset = Branch.objects.filter(is_active=True)
    serializer_class = BranchSerializer
