# Production Setup Guide for Khanz Restaurant

Quick guide to fix common production issues.

## 🚨 Admin Panel 400 Bad Request Fix

If you're getting 400 Bad Request on admin panel, follow these steps:

### 1. Update .env File on Production Server

```bash
ssh root@192.168.1.74
cd /root/khanz

# Edit .env file
nano .env
```

Add/Update these lines (replace with your actual values):

```bash
# Database
POSTGRES_DB=khanz_db
POSTGRES_USER=khanz_user
POSTGRES_PASSWORD=your_strong_password_here

# Django
DEBUG=False
DJANGO_SECRET_KEY=your-secret-key-here

# CRITICAL: Add ALL domains and IPs that will access the site
ALLOWED_HOSTS=localhost,127.0.0.1,192.168.1.74,khanz.qaam.work,www.khanz.qaam.work

# CORS - Frontend origins
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://192.168.1.74:3000,https://khanz.qaam.work,https://www.khanz.qaam.work

# CSRF - REQUIRED for admin panel to work
CSRF_TRUSTED_ORIGINS=http://localhost,http://127.0.0.1,http://192.168.1.74,https://khanz.qaam.work,https://www.khanz.qaam.work

# Google Calendar
GOOGLE_CALENDAR_ENABLED=True
GOOGLE_CALENDAR_ID=primary

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-gmail-app-password
DEFAULT_FROM_EMAIL=Khanz Restaurant <noreply@khanz.qaam.work>
```

### 2. Restart Services

```bash
# Stop all containers
docker-compose down

# Start all containers
docker-compose up -d

# Check if all services are running
docker-compose ps
```

### 3. Verify Services

```bash
# Check backend logs
docker-compose logs backend | tail -50

# Check nginx logs
docker-compose logs nginx | tail -20

# Test backend directly
curl -I http://localhost:8000/admin/

# Test through nginx
curl -I http://localhost/admin/
```

### 4. Test Admin Access

- Direct backend: http://192.168.1.74:8000/admin/
- Through Nginx: http://192.168.1.74/admin/
- Through Cloudflare: https://khanz.qaam.work/admin/

## 🔍 Common Issues

### Issue 1: 400 Bad Request
**Cause**: Missing domain in `ALLOWED_HOSTS` or `CSRF_TRUSTED_ORIGINS`

**Fix**: Make sure `.env` has all domains:
```bash
ALLOWED_HOSTS=localhost,127.0.0.1,192.168.1.74,khanz.qaam.work,www.khanz.qaam.work
CSRF_TRUSTED_ORIGINS=http://localhost,http://127.0.0.1,http://192.168.1.74,https://khanz.qaam.work,https://www.khanz.qaam.work
```

### Issue 2: 502 Bad Gateway
**Cause**: Backend not running or not accessible

**Fix**:
```bash
docker-compose ps
docker-compose restart backend
docker-compose logs backend
```

### Issue 3: Static Files Not Loading in Admin
**Cause**: Static files not collected

**Fix**:
```bash
docker-compose restart backend
docker exec khanz_nginx ls -la /var/www/khanz/staticfiles/admin/
```

### Issue 4: Nginx Not Running
**Cause**: Nginx container stopped

**Fix**:
```bash
docker-compose up -d nginx
docker-compose logs nginx
```

## 📊 Health Check Commands

```bash
# Check all containers
docker-compose ps

# Check backend health
curl http://localhost:8000/api/

# Check frontend health
curl http://localhost:3000/

# Check nginx health
curl http://localhost/

# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
```

## 🔐 Security Checklist

- [ ] Strong `DJANGO_SECRET_KEY` set
- [ ] Strong database password set
- [ ] `DEBUG=False` in production
- [ ] All domains added to `ALLOWED_HOSTS`
- [ ] All origins added to `CSRF_TRUSTED_ORIGINS`
- [ ] Google credentials files copied to server
- [ ] Email SMTP configured
- [ ] Cloudflare SSL/TLS set to "Full"

## 🚀 Quick Deployment

```bash
# On production server
cd /root/khanz

# Pull latest code
git pull origin main

# Restart all services
docker-compose down
docker-compose up -d --build

# Check status
docker-compose ps
docker-compose logs -f
```

## 📝 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `POSTGRES_DB` | Database name | `khanz_db` |
| `POSTGRES_USER` | Database user | `khanz_user` |
| `POSTGRES_PASSWORD` | Database password | `strong_password_123` |
| `DJANGO_SECRET_KEY` | Django secret key | `random-50-char-string` |
| `DEBUG` | Debug mode | `False` |
| `ALLOWED_HOSTS` | Allowed domains/IPs | `localhost,khanz.qaam.work` |
| `CORS_ALLOWED_ORIGINS` | CORS origins | `https://khanz.qaam.work` |
| `CSRF_TRUSTED_ORIGINS` | CSRF trusted origins | `https://khanz.qaam.work` |
| `EMAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `EMAIL_HOST_USER` | Email username | `your-email@gmail.com` |
| `EMAIL_HOST_PASSWORD` | Email password | `app-password` |

## 🆘 Emergency Recovery

If something goes wrong:

```bash
# Stop everything
docker-compose down

# Remove all containers and volumes (CAUTION: This deletes data!)
docker-compose down -v

# Rebuild from scratch
docker-compose up -d --build

# Run migrations
docker exec khanz_backend python manage.py migrate

# Create superuser
docker exec -it khanz_backend python manage.py createsuperuser

# Collect static files
docker exec khanz_backend python manage.py collectstatic --noinput
```

## 📞 Support

If issues persist, check:
1. Docker logs: `docker-compose logs`
2. System logs: `journalctl -u docker`
3. Disk space: `df -h`
4. Memory: `free -h`
