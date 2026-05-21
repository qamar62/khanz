# Khanz Restaurant Backend - Django REST API

Complete Django backend with Google Calendar integration for managing reservations, contact messages, and catering requests.

## 🚀 Features

- **Table Reservations**: Full CRUD with Google Calendar sync
- **Contact Messages**: Customer inquiry management
- **Catering Requests**: Event booking system
- **Branch Management**: Multi-location support
- **Django Admin Panel**: Professional UI for staff
- **Email Notifications**: Automatic confirmations
- **REST API**: Full API for Next.js frontend

## 📋 Prerequisites

- Python 3.10 or higher
- PostgreSQL (recommended) or SQLite (development)
- Google Cloud Project with Calendar API enabled

## 🛠️ Installation

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Environment Setup

Copy the example environment file:

```bash
copy .env.example .env  # Windows
cp .env.example .env    # macOS/Linux
```

Edit `.env` and configure:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (SQLite for development)
DB_ENGINE=django.db.backends.sqlite3
DB_NAME=db.sqlite3

# For production, use PostgreSQL:
# DB_ENGINE=django.db.backends.postgresql
# DB_NAME=khanz_db
# DB_USER=postgres
# DB_PASSWORD=your-password
# DB_HOST=localhost
# DB_PORT=5432

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Email (optional)
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

### 4. Google Calendar Setup

#### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Calendar API

#### Step 2: Create OAuth Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Choose **Desktop app**
4. Download the JSON file
5. Rename it to `credentials.json`
6. Place it in the `backend/` directory

#### Step 3: First-Time Authorization

```bash
python manage.py shell
```

Then run:

```python
from reservations.utils.google_calendar import get_credentials
get_credentials()
```

This will open a browser for authorization. After approval, a `token.json` file will be created.

### 5. Database Migration

```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create Superuser

```bash
python manage.py createsuperuser
```

Follow prompts to create admin account.

### 7. Load Initial Data (Optional)

Create initial branch data:

```bash
python manage.py shell
```

```python
from reservations.models import Branch

branches = [
    {
        'name': 'Khanz Fusion Buffet',
        'address': '38C East Tamaki Road, Papatoetoe, Auckland 2025',
        'phone': '+64 09 250 1919',
        'email': 'info@khanz.co.nz',
        'hours': 'Monday - Sunday: 11:30 AM - 9:30 PM',
        'is_flagship': True,
    },
    {
        'name': 'Khanz Mediterranean Restaurant',
        'address': '135 Great South Road, Papatoetoe, Auckland 2025',
        'phone': '+64 09 250 1623',
        'email': 'info@khanz.co.nz',
        'hours': 'Monday - Sunday: 12:00 PM - 9:00 PM',
    },
    {
        'name': 'Khanz Restaurant Botany',
        'address': '302 Te Irirangi Drive, Flat Bush, Auckland 2013',
        'phone': '+64 9 250 4414',
        'email': 'info@khanz.co.nz',
        'hours': 'Monday - Sunday: 11:30 AM - 10:00 PM',
    },
    {
        'name': 'Khanz Takeaway',
        'address': '10/71 Jellicoe Road, Panmure, Auckland 2025',
        'phone': '+64 09 527 0647',
        'email': 'info@khanz.co.nz',
        'hours': 'Monday - Sunday: 11:00 AM - 9:00 PM',
    },
]

for branch_data in branches:
    Branch.objects.create(**branch_data)

print("Branches created successfully!")
```

## 🚀 Running the Server

### Development Server

```bash
python manage.py runserver
```

Server will start at: `http://localhost:8000`

### API Endpoints

- **Reservations**: `http://localhost:8000/api/reservations/`
- **Contacts**: `http://localhost:8000/api/contacts/`
- **Catering**: `http://localhost:8000/api/catering/`
- **Branches**: `http://localhost:8000/api/branches/`

### Admin Panel

Access at: `http://localhost:8000/admin/`

Login with superuser credentials created earlier.

## 📚 API Documentation

### Reservations API

#### Create Reservation
```bash
POST /api/reservations/
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+64 21 123 4567",
  "date": "2025-05-25",
  "time": "19:00",
  "guests": 4,
  "occasion": "birthday",
  "special_requests": "Window seat please"
}
```

#### List Reservations
```bash
GET /api/reservations/
```

#### Get Single Reservation
```bash
GET /api/reservations/{id}/
```

#### Confirm Reservation
```bash
POST /api/reservations/{id}/confirm/
```

#### Cancel Reservation
```bash
POST /api/reservations/{id}/cancel/
```

### Contact Messages API

#### Create Contact Message
```bash
POST /api/contacts/
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+64 21 987 6543",
  "message": "I'd like to inquire about private dining options."
}
```

### Catering Requests API

#### Create Catering Request
```bash
POST /api/catering/
Content-Type: application/json

{
  "name": "Corporate Events Ltd",
  "email": "events@company.com",
  "phone": "+64 9 123 4567",
  "event_type": "corporate",
  "event_date": "2025-06-15",
  "guest_count": 50,
  "venue_address": "123 Business St, Auckland",
  "message": "Need catering for annual conference"
}
```

### Branches API

#### List All Active Branches
```bash
GET /api/branches/
```

## 🎨 Django Admin Features

### Reservation Management
- View all reservations with filters
- Color-coded status badges
- Sync to Google Calendar action
- Bulk status updates
- Search by name, email, phone

### Contact Messages
- Status tracking (New, Read, Replied, Archived)
- Quick actions for status updates
- Search functionality

### Catering Requests
- Event type filtering
- Budget tracking
- Internal notes
- Status workflow

### Branch Management
- Multi-location support
- Active/inactive toggle
- Flagship designation

## 🔧 Troubleshooting

### Google Calendar Issues

**Error: credentials.json not found**
- Download OAuth credentials from Google Cloud Console
- Place in `backend/` directory

**Error: Token expired**
```bash
# Delete token and re-authorize
rm token.json
python manage.py shell
from reservations.utils.google_calendar import get_credentials
get_credentials()
```

### Database Issues

**Reset database (development only)**
```bash
# Delete database
rm db.sqlite3

# Delete migrations
rm reservations/migrations/0*.py

# Recreate
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

### CORS Issues

If frontend can't connect:
1. Check `CORS_ALLOWED_ORIGINS` in `.env`
2. Ensure frontend URL is included
3. Restart Django server

## 📦 Production Deployment

### Environment Variables

Set these in production:
```env
DEBUG=False
SECRET_KEY=<strong-random-key>
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DB_ENGINE=django.db.backends.postgresql
# ... other production settings
```

### Static Files

```bash
python manage.py collectstatic
```

### Database

Use PostgreSQL in production:
```bash
pip install psycopg2-binary
```

### Security Checklist

- [ ] Set `DEBUG=False`
- [ ] Use strong `SECRET_KEY`
- [ ] Configure proper `ALLOWED_HOSTS`
- [ ] Use PostgreSQL
- [ ] Set up HTTPS
- [ ] Configure email backend
- [ ] Secure Google Calendar credentials
- [ ] Set up proper CORS origins

## 🧪 Testing

```bash
python manage.py test
```

## 📝 License

Proprietary - Khanz Restaurant

## 🤝 Support

For issues or questions, contact: info@khanz.co.nz
