# Quick Setup Guide - Khanz Backend

## 🚀 5-Minute Setup

### Step 1: Install Python Dependencies (2 min)

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### Step 2: Configure Environment (1 min)

```bash
copy .env.example .env
```

Edit `.env` - minimum required:
```env
SECRET_KEY=django-insecure-change-this-key-123456789
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Step 3: Setup Database (1 min)

```bash
python manage.py migrate
python manage.py createsuperuser
```

### Step 4: Run Server (30 sec)

```bash
python manage.py runserver
```

✅ **Backend running at:** `http://localhost:8000`
✅ **Admin panel at:** `http://localhost:8000/admin`

---

## 📅 Google Calendar Setup (Optional - 5 min)

### Quick Steps:

1. **Get Credentials**
   - Go to: https://console.cloud.google.com/
   - Create project → Enable Calendar API
   - Create OAuth credentials (Desktop app)
   - Download as `credentials.json`
   - Place in `backend/` folder

2. **Authorize**
   ```bash
   python manage.py shell
   ```
   ```python
   from reservations.utils.google_calendar import get_credentials
   get_credentials()
   ```
   - Browser opens → Sign in → Allow access
   - `token.json` created automatically

3. **Test**
   - Create a reservation via admin panel
   - Check your Google Calendar!

---

## 🔗 Connect Frontend

### In Next.js project root:

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Restart Next.js:
```bash
npm run dev
```

✅ **Done!** Frontend now talks to Django backend.

---

## 🎯 Quick Test

### Test API:

```bash
# Windows PowerShell
Invoke-RestMethod -Uri http://localhost:8000/api/branches/ -Method Get

# Or visit in browser:
http://localhost:8000/api/branches/
```

### Create Test Reservation:

1. Go to: `http://localhost:8000/admin`
2. Login with superuser
3. Click **Reservations** → **Add Reservation**
4. Fill form → Save
5. Check Google Calendar (if configured)

---

## ⚡ Common Commands

```bash
# Start server
python manage.py runserver

# Create admin user
python manage.py createsuperuser

# Reset database (dev only)
python manage.py flush

# Make migrations
python manage.py makemigrations
python manage.py migrate

# Django shell
python manage.py shell
```

---

## 🆘 Quick Fixes

### Can't connect from frontend?
- Check backend is running: `http://localhost:8000/api/`
- Check CORS in `.env`: `CORS_ALLOWED_ORIGINS=http://localhost:3000`
- Restart both servers

### Google Calendar not working?
- Skip it for now! Everything else works fine
- Reservations save to database
- Add Calendar later when needed

### Database errors?
```bash
rm db.sqlite3
python manage.py migrate
python manage.py createsuperuser
```

---

## 📱 Next Steps

1. ✅ Backend running
2. ✅ Admin panel accessible
3. ✅ Frontend connected
4. 🎉 Start testing reservations!

**Need help?** Check `README.md` for detailed docs.
