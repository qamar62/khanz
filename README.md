# 🍽️ Khanz Restaurant - Full Stack Web Application

Modern restaurant website with reservation system, Google Calendar integration, and Django backend.

## 🌟 Features

- ✨ **Modern Next.js Frontend** - Beautiful, responsive UI with animations
- 🔐 **Django REST API Backend** - Secure and scalable
- 📅 **Google Calendar Integration** - Automatic reservation syncing
- 📧 **Email Notifications** - Automated confirmation emails
- 🎨 **Google Reviews Display** - Showcase customer feedback
- 🐳 **Docker Ready** - Easy deployment with Docker Compose
- 📱 **Fully Responsive** - Works on all devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose (for production)
- Google Cloud account (for Calendar API)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/qamar62/khanz.git
   cd khanz
   ```

2. **Setup Frontend**
   ```bash
   npm install
   cp .env.example .env.local
   # Edit .env.local with your settings
   npm run dev
   ```

3. **Setup Backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your settings
   python manage.py migrate
   python manage.py createsuperuser
   python manage.py runserver
   ```

4. **Setup Google Calendar**
   - Follow instructions in `backend/SETUP_GUIDE.md`
   - Place `credentials.json` and `token.json` in `backend/` directory

### Production Deployment with Docker

1. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

2. **Deploy**
   ```bash
   docker-compose build
   docker-compose up -d
   docker-compose exec backend python manage.py migrate
   docker-compose exec backend python manage.py createsuperuser
   ```

3. **Access**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api
   - Admin Panel: http://localhost:8000/admin

## 📚 Documentation

- [Deployment Guide](DEPLOYMENT.md) - Complete production deployment instructions
- [Backend Setup](backend/SETUP_GUIDE.md) - Backend configuration guide
- [Backend README](backend/README.md) - API documentation

## 🛠️ Tech Stack

### Frontend
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Radix UI

### Backend
- Django 5.0
- Django REST Framework
- PostgreSQL
- Google Calendar API
- Gunicorn

### DevOps
- Docker & Docker Compose
- Nginx
- GitHub Actions (coming soon)

## 📁 Project Structure

```
khanz/
├── app/                    # Next.js pages
├── components/             # React components
├── lib/                    # Utilities and API client
├── backend/                # Django backend
│   ├── khanz_backend/      # Django project settings
│   ├── reservations/       # Main app
│   └── requirements.txt    # Python dependencies
├── docker-compose.yml      # Production Docker setup
├── Dockerfile              # Frontend Docker image
└── README.md               # This file
```

## 🔒 Security

- ⚠️ **NEVER commit** `credentials.json`, `token.json`, or `.env` files
- 🔑 Use strong passwords for database and Django SECRET_KEY
- 🌐 Configure proper CORS origins for production
- 🔐 Use environment variables for all secrets

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 📞 Contact

For support or inquiries, please contact the development team.

## 🙏 Acknowledgments

- Google Calendar API
- Next.js team
- Django community
- All contributors

---

Made with ❤️ for Khanz Restaurant
