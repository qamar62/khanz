# Nginx Setup for Khanz Restaurant

This guide explains how to set up Nginx as a reverse proxy for your Khanz Restaurant application with Cloudflare.

## 🌐 Architecture

```
Cloudflare (https://khanz.qaam.work)
    ↓
Nginx (Port 80/443)
    ↓
├── Frontend (localhost:3000) - Next.js
├── Backend (localhost:8000) - Django API
└── Admin (localhost:8000/admin) - Django Admin
```

## 📋 Prerequisites

- Docker containers running with host networking
- Nginx installed on your server
- Cloudflare configured with your domain

## 🚀 Installation Steps

### 1. Install Nginx (if not already installed)

```bash
sudo apt update
sudo apt install nginx -y
```

### 2. Copy Nginx Configuration

```bash
# Copy the production nginx config
sudo cp nginx-production.conf /etc/nginx/sites-available/khanz

# Create symbolic link
sudo ln -s /etc/nginx/sites-available/khanz /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default
```

### 3. Create Static Files Directory

```bash
# Create directories for Django static and media files
sudo mkdir -p /var/www/khanz/staticfiles
sudo mkdir -p /var/www/khanz/media

# Set permissions
sudo chown -R www-data:www-data /var/www/khanz
```

### 4. Collect Django Static Files

```bash
# Run from your project directory
cd /root/khanz

# Collect static files to the nginx directory
docker exec khanz_backend python manage.py collectstatic --noinput

# Copy static files to nginx directory
sudo cp -r backend/staticfiles/* /var/www/khanz/staticfiles/
```

### 5. Test Nginx Configuration

```bash
# Test configuration
sudo nginx -t

# If successful, reload nginx
sudo systemctl reload nginx
```

### 6. Enable Nginx to Start on Boot

```bash
sudo systemctl enable nginx
sudo systemctl start nginx
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

1. **Check static files are collected:**
   ```bash
   ls -la /var/www/khanz/staticfiles/admin/
   ```

2. **Check Nginx error logs:**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

3. **Check backend is running:**
   ```bash
   docker ps | grep khanz_backend
   curl http://localhost:8000/admin/
   ```

4. **Verify ALLOWED_HOSTS in Django:**
   ```bash
   # In your .env file
   ALLOWED_HOSTS=localhost,127.0.0.1,khanz.qaam.work,www.khanz.qaam.work
   ```

### 502 Bad Gateway

1. **Check if services are running:**
   ```bash
   docker-compose ps
   ```

2. **Check if ports are listening:**
   ```bash
   netstat -tlnp | grep -E '3000|8000'
   ```

3. **Restart services:**
   ```bash
   docker-compose restart
   sudo systemctl restart nginx
   ```

### Static Files Not Loading

1. **Recollect static files:**
   ```bash
   docker exec khanz_backend python manage.py collectstatic --noinput --clear
   sudo cp -r backend/staticfiles/* /var/www/khanz/staticfiles/
   ```

2. **Check permissions:**
   ```bash
   sudo chown -R www-data:www-data /var/www/khanz
   sudo chmod -R 755 /var/www/khanz
   ```

## 📊 Monitoring

### View Nginx Access Logs
```bash
sudo tail -f /var/log/nginx/access.log
```

### View Nginx Error Logs
```bash
sudo tail -f /var/log/nginx/error.log
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
# Copy new config
sudo cp nginx-production.conf /etc/nginx/sites-available/khanz

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
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
