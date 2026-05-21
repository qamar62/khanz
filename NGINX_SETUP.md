# Nginx Setup for Khanz Restaurant

This guide explains how to set up Nginx as a reverse proxy for your Khanz Restaurant application with Cloudflare.

## 🌐 Architecture

```
Cloudflare (https://khanz.qaam.work)
    ↓
Nginx Container (Port 80) - Host Network
    ↓
├── Frontend (localhost:3000) - Next.js Container
├── Backend (localhost:8000) - Django Container
└── Admin (localhost:8000/admin) - Django Admin
```

## 📋 Prerequisites

- Docker and Docker Compose installed
- Cloudflare configured with your domain
- `.env` file configured with proper settings

## 🚀 Deployment (Everything in Docker!)

### 1. Pull Latest Code

```bash
cd /root/khanz
git pull origin main
```

### 2. Configure Environment

```bash
# Make sure .env file has correct settings
nano .env

# Required settings:
ALLOWED_HOSTS=localhost,127.0.0.1,khanz.qaam.work,www.khanz.qaam.work
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://khanz.qaam.work,https://www.khanz.qaam.work
```

### 3. Deploy All Services (Including Nginx!)

```bash
# Build and start all containers
docker-compose up -d --build

# Check all services are running
docker-compose ps
```

That's it! Nginx is now running as a Docker container alongside your application.

### 4. Verify Deployment

```bash
# Check nginx logs
docker-compose logs nginx

# Check all services
docker-compose logs -f
```

## 🔧 Cloudflare Configuration

### DNS Settings

1. Go to Cloudflare Dashboard → DNS
2. Add/Update A record:
   - **Type**: A
   - **Name**: khanz (or @)
   - **Content**: Your server IP
   - **Proxy status**: Proxied (orange cloud)

### SSL/TLS Settings

1. Go to SSL/TLS → Overview
2. Set encryption mode to **Full** or **Full (strict)**

### Page Rules (Optional for Performance)

1. Go to Rules → Page Rules
2. Add rule for `khanz.qaam.work/_next/static/*`:
   - Cache Level: Cache Everything
   - Edge Cache TTL: 1 year

## 📁 Directory Structure

```
/var/www/khanz/
├── staticfiles/        # Django static files (CSS, JS, admin)
│   ├── admin/
│   ├── rest_framework/
│   └── ...
└── media/             # User uploaded files
    └── ...
```

## 🔍 Testing

### Test Backend API
```bash
curl http://localhost:8000/api/
curl https://khanz.qaam.work/api/
```

### Test Admin Panel
```bash
curl http://localhost:8000/admin/
curl https://khanz.qaam.work/admin/
```

### Test Frontend
```bash
curl http://localhost:3000/
curl https://khanz.qaam.work/
```

## 🐛 Troubleshooting

### Admin Page Not Loading

1. **Check Nginx container logs:**
   ```bash
   docker-compose logs nginx
   ```

2. **Check backend is running:**
   ```bash
   docker-compose ps
   curl http://localhost:8000/admin/
   ```

3. **Verify ALLOWED_HOSTS in Django:**
   ```bash
   # In your .env file
   ALLOWED_HOSTS=localhost,127.0.0.1,khanz.qaam.work,www.khanz.qaam.work
   ```

4. **Check static files in volume:**
   ```bash
   docker exec khanz_nginx ls -la /var/www/khanz/staticfiles/admin/
   ```

### 502 Bad Gateway

1. **Check if all services are running:**
   ```bash
   docker-compose ps
   ```

2. **Check if ports are listening:**
   ```bash
   netstat -tlnp | grep -E '3000|8000|80'
   ```

3. **Restart all services:**
   ```bash
   docker-compose restart
   ```

### Static Files Not Loading

1. **Restart backend to recollect static files:**
   ```bash
   docker-compose restart backend
   ```

2. **Check static files volume:**
   ```bash
   docker volume inspect khanz_static_volume
   docker exec khanz_nginx ls -la /var/www/khanz/staticfiles/
   ```

## 📊 Monitoring

### View Nginx Logs
```bash
docker-compose logs -f nginx
```

### View Application Logs
```bash
# Backend logs
docker-compose logs -f backend

# Frontend logs
docker-compose logs -f frontend

# All logs
docker-compose logs -f
```

## 🔄 Updating Configuration

After making changes to `nginx-production.conf`:

```bash
# Pull latest changes
git pull origin main

# Restart nginx container
docker-compose restart nginx

# Or rebuild if needed
docker-compose up -d --build nginx
```

## 🔒 Security Recommendations

1. **Enable HTTPS** (Cloudflare handles this automatically)
2. **Set strong Django SECRET_KEY**
3. **Configure CORS properly**
4. **Enable rate limiting** (already configured in nginx)
5. **Regular updates:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

## 📝 Notes

- Nginx runs on port 80 (HTTP)
- Cloudflare provides SSL/TLS termination
- Static files are served directly by Nginx (faster)
- API and admin requests are proxied to Django
- Frontend requests are proxied to Next.js
