# 🚀 Khanz Restaurant - Production Deployment Guide

Complete guide for deploying the Khanz Restaurant application using Docker Compose.

## 📋 Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- Domain name (optional, for production)
- SSL certificate (optional, for HTTPS)

## 🏗️ Architecture

```
┌─────────────┐
│   Nginx     │ :80, :443 (Reverse Proxy)
└──────┬──────┘
       │
       ├─────────────┐
       │             │
┌──────▼──────┐ ┌───▼────────┐
│  Frontend   │ │  Backend   │
│  (Next.js)  │ │  (Django)  │
│    :3000    │ │   :8000    │
└─────────────┘ └──────┬─────┘
                       │
                ┌──────▼──────┐
                │ PostgreSQL  │
                │    :5432    │
                └─────────────┘
```

## 🔧 Setup Instructions

### 1. Clone and Navigate

```bash
cd /path/to/khanz
```

### 2. Configure Environment Variables

#### Backend Configuration

Edit `backend/.env.production`:

```env
# IMPORTANT: Change these values!
SECRET_KEY=your-random-secret-key-here
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,localhost

# Database
DATABASE_URL=postgresql://khanz_user:STRONG_PASSWORD_HERE@db:5432/khanz_db

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Email (Gmail example)
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-gmail-app-password
DEFAULT_FROM_EMAIL=Khanz Restaurant <noreply@yourdomain.com>
```

#### Frontend Configuration

Edit `.env.production`:

```env
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
```

#### Docker Compose Configuration

Edit `docker-compose.yml` and update:

```yaml
environment:
  - POSTGRES_PASSWORD=STRONG_PASSWORD_HERE  # Change this!
  - SECRET_KEY=your-secret-key-here         # Change this!
```

### 3. Google Calendar Setup

Copy your Google Calendar credentials:

```bash
# Make sure these files exist in backend/
cp credentials.json backend/
cp token.json backend/
```

### 4. Build and Start Services

```bash
# Build all containers
docker-compose build

# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

### 5. Initialize Database

```bash
# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser for Django admin
docker-compose exec backend python manage.py createsuperuser

# Collect static files
docker-compose exec backend python manage.py collectstatic --noinput
```

## 🌐 Access Your Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Django Admin**: http://localhost:8000/admin
- **Nginx (if enabled)**: http://localhost

## 📊 Monitoring & Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Check container status
docker-compose ps

# Check resource usage
docker stats
```

## 🔄 Common Operations

### Update Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d

# Run migrations if needed
docker-compose exec backend python manage.py migrate
```

### Backup Database

```bash
# Create backup
docker-compose exec db pg_dump -U khanz_user khanz_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker-compose exec -T db psql -U khanz_user khanz_db < backup_20260520_120000.sql
```

### Scale Services

```bash
# Scale backend workers
docker-compose up -d --scale backend=3
```

## 🔒 Production Security Checklist

- [ ] Change all default passwords
- [ ] Set strong `SECRET_KEY` in Django
- [ ] Configure proper `ALLOWED_HOSTS`
- [ ] Set `DEBUG=False`
- [ ] Enable HTTPS with SSL certificate
- [ ] Configure firewall rules
- [ ] Set up regular database backups
- [ ] Enable rate limiting in Nginx
- [ ] Secure Google Calendar credentials
- [ ] Configure proper CORS origins
- [ ] Set up monitoring and alerts
- [ ] Review and update dependencies

## 🌍 Domain & SSL Setup

### Using Nginx with SSL (Let's Encrypt)

1. Install Certbot:

```bash
docker-compose exec nginx apk add certbot certbot-nginx
```

2. Obtain SSL certificate:

```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

3. Update `nginx.conf` to redirect HTTP to HTTPS

### Using Cloud Providers

#### AWS (Elastic Beanstalk / ECS)
- Use Application Load Balancer for SSL termination
- Store credentials in AWS Secrets Manager
- Use RDS for PostgreSQL

#### Google Cloud (Cloud Run / GKE)
- Use Cloud Load Balancer for SSL
- Store credentials in Secret Manager
- Use Cloud SQL for PostgreSQL

#### DigitalOcean (App Platform)
- Automatic SSL certificates
- Use Managed Database for PostgreSQL
- Environment variables in dashboard

## 🐛 Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs backend

# Rebuild without cache
docker-compose build --no-cache backend
docker-compose up -d
```

### Database connection issues

```bash
# Check database is running
docker-compose ps db

# Test connection
docker-compose exec backend python manage.py dbshell
```

### Static files not loading

```bash
# Collect static files
docker-compose exec backend python manage.py collectstatic --noinput

# Check volume mounts
docker-compose exec backend ls -la /app/staticfiles
```

### Google Calendar not working

```bash
# Check credentials exist
docker-compose exec backend ls -la /app/credentials/

# Check environment variables
docker-compose exec backend env | grep GOOGLE
```

## 📈 Performance Optimization

### Production Settings

1. **Enable Gunicorn workers** (already configured):
   - Workers: 3 (adjust based on CPU cores)
   - Formula: `(2 x CPU cores) + 1`

2. **Enable Redis for caching** (optional):

```yaml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
```

3. **Configure CDN** for static files:
   - Use AWS CloudFront
   - Or Cloudflare CDN

## 🔐 Environment Variables Reference

### Backend (.env.production)

| Variable | Description | Example |
|----------|-------------|---------|
| `DEBUG` | Debug mode | `False` |
| `SECRET_KEY` | Django secret key | `your-secret-key` |
| `ALLOWED_HOSTS` | Allowed domains | `yourdomain.com` |
| `DATABASE_URL` | PostgreSQL connection | `postgresql://user:pass@db:5432/dbname` |
| `CORS_ALLOWED_ORIGINS` | CORS origins | `https://yourdomain.com` |
| `GOOGLE_CALENDAR_ENABLED` | Enable calendar | `True` |
| `EMAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `EMAIL_HOST_USER` | Email username | `your@email.com` |
| `EMAIL_HOST_PASSWORD` | Email password | `app-password` |

### Frontend (.env.production)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://yourdomain.com/api` |

## 📞 Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- Review Django admin: `/admin`
- Check database: `docker-compose exec db psql -U khanz_user khanz_db`

## 🎉 Success!

Your Khanz Restaurant application is now running in production with:
- ✅ Next.js frontend
- ✅ Django backend with REST API
- ✅ PostgreSQL database
- ✅ Google Calendar integration
- ✅ Email notifications
- ✅ Nginx reverse proxy
- ✅ Docker containerization

Visit your application and start accepting reservations! 🍽️
