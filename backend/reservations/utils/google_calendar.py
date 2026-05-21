"""
Google Calendar Integration Utilities
"""
import os
import pickle
from datetime import datetime, timedelta
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from django.conf import settings


# If modifying these scopes, delete the token file.
SCOPES = ['https://www.googleapis.com/auth/calendar']


def get_credentials():
    """
    Get or refresh Google Calendar API credentials
    """
    creds = None
    token_file = os.path.join(settings.BASE_DIR, settings.GOOGLE_CALENDAR_TOKEN_FILE)
    credentials_file = os.path.join(settings.BASE_DIR, settings.GOOGLE_CALENDAR_CREDENTIALS_FILE)
    
    # The file token.pickle stores the user's access and refresh tokens
    if os.path.exists(token_file):
        with open(token_file, 'rb') as token:
            creds = pickle.load(token)
    
    # If there are no (valid) credentials available, let the user log in
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists(credentials_file):
                raise FileNotFoundError(
                    f"Google Calendar credentials file not found at {credentials_file}. "
                    "Please download credentials.json from Google Cloud Console."
                )
            
            flow = InstalledAppFlow.from_client_secrets_file(
                credentials_file, SCOPES
            )
            creds = flow.run_local_server(port=0)
        
        # Save the credentials for the next run
        with open(token_file, 'wb') as token:
            pickle.dump(creds, token)
    
    return creds


def get_calendar_service():
    """
    Get Google Calendar API service
    """
    creds = get_credentials()
    service = build('calendar', 'v3', credentials=creds)
    return service


def create_calendar_event(reservation):
    """
    Create a Google Calendar event for a reservation
    
    Args:
        reservation: Reservation model instance
    
    Returns:
        str: Google Calendar event ID
    """
    try:
        service = get_calendar_service()
        
        # Combine date and time
        start_datetime = datetime.combine(reservation.date, reservation.time)
        # Assume 2-hour duration for reservations
        end_datetime = start_datetime + timedelta(hours=2)
        
        # Format datetime for Google Calendar API
        start_iso = start_datetime.isoformat()
        end_iso = end_datetime.isoformat()
        
        # Create event description
        description = f"""
Reservation Details:
- Name: {reservation.name}
- Email: {reservation.email}
- Phone: {reservation.phone}
- Guests: {reservation.guests}
- Occasion: {reservation.get_occasion_display() if reservation.occasion != 'none' else 'None'}

Special Requests:
{reservation.special_requests if reservation.special_requests else 'None'}

Status: {reservation.get_status_display()}
        """.strip()
        
        event = {
            'summary': f'Table Reservation - {reservation.name} ({reservation.guests} guests)',
            'description': description,
            'start': {
                'dateTime': start_iso,
                'timeZone': 'Pacific/Auckland',
            },
            'end': {
                'dateTime': end_iso,
                'timeZone': 'Pacific/Auckland',
            },
            'attendees': [
                {'email': reservation.email},
            ],
            'reminders': {
                'useDefault': False,
                'overrides': [
                    {'method': 'email', 'minutes': 24 * 60},  # 1 day before
                    {'method': 'popup', 'minutes': 60},  # 1 hour before
                ],
            },
            'colorId': '2',  # Sage color for reservations
        }
        
        # Insert event
        event_result = service.events().insert(
            calendarId=settings.GOOGLE_CALENDAR_ID,
            body=event,
            sendUpdates='all'  # Send email notifications
        ).execute()
        
        print(f"Calendar event created: {event_result.get('htmlLink')}")
        return event_result['id']
    
    except HttpError as error:
        print(f"An error occurred: {error}")
        raise
    except Exception as error:
        print(f"Failed to create calendar event: {error}")
        raise


def update_calendar_event(reservation):
    """
    Update an existing Google Calendar event
    
    Args:
        reservation: Reservation model instance with google_calendar_event_id
    
    Returns:
        str: Google Calendar event ID
    """
    if not reservation.google_calendar_event_id:
        return create_calendar_event(reservation)
    
    try:
        service = get_calendar_service()
        
        # Get existing event
        event = service.events().get(
            calendarId=settings.GOOGLE_CALENDAR_ID,
            eventId=reservation.google_calendar_event_id
        ).execute()
        
        # Update event details
        start_datetime = datetime.combine(reservation.date, reservation.time)
        end_datetime = start_datetime + timedelta(hours=2)
        
        event['summary'] = f'Table Reservation - {reservation.name} ({reservation.guests} guests)'
        event['start'] = {
            'dateTime': start_datetime.isoformat(),
            'timeZone': 'Pacific/Auckland',
        }
        event['end'] = {
            'dateTime': end_datetime.isoformat(),
            'timeZone': 'Pacific/Auckland',
        }
        
        # Update event
        updated_event = service.events().update(
            calendarId=settings.GOOGLE_CALENDAR_ID,
            eventId=reservation.google_calendar_event_id,
            body=event,
            sendUpdates='all'
        ).execute()
        
        print(f"Calendar event updated: {updated_event.get('htmlLink')}")
        return updated_event['id']
    
    except HttpError as error:
        print(f"An error occurred: {error}")
        raise


def delete_calendar_event(event_id):
    """
    Delete a Google Calendar event
    
    Args:
        event_id: Google Calendar event ID
    
    Returns:
        bool: True if successful
    """
    try:
        service = get_calendar_service()
        
        service.events().delete(
            calendarId=settings.GOOGLE_CALENDAR_ID,
            eventId=event_id,
            sendUpdates='all'
        ).execute()
        
        print(f"Calendar event deleted: {event_id}")
        return True
    
    except HttpError as error:
        if error.resp.status == 404:
            print(f"Event not found: {event_id}")
            return True  # Event already deleted
        print(f"An error occurred: {error}")
        raise
    except Exception as error:
        print(f"Failed to delete calendar event: {error}")
        raise


def list_upcoming_events(max_results=10):
    """
    List upcoming events from Google Calendar
    
    Args:
        max_results: Maximum number of events to return
    
    Returns:
        list: List of event dictionaries
    """
    try:
        service = get_calendar_service()
        
        # Get current time in ISO format
        now = datetime.utcnow().isoformat() + 'Z'
        
        events_result = service.events().list(
            calendarId=settings.GOOGLE_CALENDAR_ID,
            timeMin=now,
            maxResults=max_results,
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        
        events = events_result.get('items', [])
        return events
    
    except HttpError as error:
        print(f"An error occurred: {error}")
        return []
