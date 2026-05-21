from rest_framework import serializers
from .models import Reservation, ContactMessage, CateringRequest, Branch
from datetime import date, time as datetime_time


class ReservationSerializer(serializers.ModelSerializer):
    """Serializer for Reservation model"""
    
    is_upcoming = serializers.ReadOnlyField()
    
    class Meta:
        model = Reservation
        fields = [
            'id', 'name', 'email', 'phone', 'date', 'time', 'guests',
            'occasion', 'special_requests', 'status', 'google_calendar_event_id',
            'is_upcoming', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'google_calendar_event_id', 'created_at', 'updated_at']
    
    def validate_date(self, value):
        """Ensure reservation date is not in the past"""
        if value < date.today():
            raise serializers.ValidationError("Reservation date cannot be in the past.")
        return value
    
    def validate_guests(self, value):
        """Validate guest count"""
        if value < 1:
            raise serializers.ValidationError("Must have at least 1 guest.")
        if value > 20:
            raise serializers.ValidationError(
                "For parties larger than 20, please contact us directly."
            )
        return value


class ContactMessageSerializer(serializers.ModelSerializer):
    """Serializer for ContactMessage model"""
    
    class Meta:
        model = ContactMessage
        fields = [
            'id', 'name', 'email', 'phone', 'message',
            'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'status', 'created_at', 'updated_at']
    
    def validate_message(self, value):
        """Ensure message is not empty"""
        if not value.strip():
            raise serializers.ValidationError("Message cannot be empty.")
        return value


class CateringRequestSerializer(serializers.ModelSerializer):
    """Serializer for CateringRequest model"""
    
    class Meta:
        model = CateringRequest
        fields = [
            'id', 'name', 'email', 'phone', 'event_type', 'event_date',
            'guest_count', 'venue_address', 'message', 'status',
            'estimated_budget', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'status', 'estimated_budget', 'notes', 'created_at', 'updated_at']
    
    def validate_event_date(self, value):
        """Ensure event date is not in the past"""
        if value < date.today():
            raise serializers.ValidationError("Event date cannot be in the past.")
        return value
    
    def validate_guest_count(self, value):
        """Validate guest count for catering"""
        if value < 10:
            raise serializers.ValidationError(
                "Minimum 10 guests required for catering services."
            )
        return value


class BranchSerializer(serializers.ModelSerializer):
    """Serializer for Branch model"""
    
    class Meta:
        model = Branch
        fields = [
            'id', 'name', 'address', 'phone', 'email', 'hours',
            'is_flagship', 'is_active', 'google_maps_url', 'description',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
