# Quick Fix for Reservation API Connection Error

## Problem
Frontend showing "Failed to fetch" and trying to connect to `localhost:8000/api/reservations/`

## Solution
The frontend needs to use a relative URL (`/api`) so Nginx can proxy it to the backend.

## Fix on Production Server

```bash
ssh root@192.168.1.74
cd /root/khanz

# Pull latest changes
git pull origin main

# Rebuild and restart frontend
docker-compose up -d --build frontend

# Verify it's working
docker-compose logs frontend | tail -20
```

## Test
1. Go to https://khanz.qaam.work/reservation
2. Fill out the form
3. Submit - should work now!

## How It Works

**Before (Broken):**
```
Browser → localhost:8000/api ❌ (Connection refused)
```

**After (Fixed):**
```
Browser → khanz.qaam.work/api → Nginx → Backend ✅
```

By using `/api` (relative URL), the browser makes the request to the same domain it's on, and Nginx proxies it to the backend.
