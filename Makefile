# Khanz Restaurant - Docker Commands

.PHONY: help build up down logs restart clean migrate superuser collectstatic backup

help:
	@echo "Khanz Restaurant - Docker Commands"
	@echo ""
	@echo "Development:"
	@echo "  make dev-build    - Build development containers"
	@echo "  make dev-up       - Start development environment"
	@echo "  make dev-down     - Stop development environment"
	@echo ""
	@echo "Production:"
	@echo "  make build        - Build production containers"
	@echo "  make up           - Start production environment"
	@echo "  make down         - Stop production environment"
	@echo "  make restart      - Restart all services"
	@echo ""
	@echo "Database:"
	@echo "  make migrate      - Run database migrations"
	@echo "  make superuser    - Create Django superuser"
	@echo "  make backup       - Backup database"
	@echo ""
	@echo "Maintenance:"
	@echo "  make logs         - View all logs"
	@echo "  make logs-backend - View backend logs"
	@echo "  make logs-frontend- View frontend logs"
	@echo "  make collectstatic- Collect static files"
	@echo "  make clean        - Remove all containers and volumes"

# Development
dev-build:
	docker-compose -f docker-compose.dev.yml build

dev-up:
	docker-compose -f docker-compose.dev.yml up -d
	@echo "Development environment started!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend: http://localhost:8000"

dev-down:
	docker-compose -f docker-compose.dev.yml down

# Production
build:
	docker-compose build

up:
	docker-compose up -d
	@echo "Production environment started!"
	@echo "Application: http://localhost"

down:
	docker-compose down

restart:
	docker-compose restart

# Database
migrate:
	docker-compose exec backend python manage.py migrate

superuser:
	docker-compose exec backend python manage.py createsuperuser

backup:
	@mkdir -p backups
	docker-compose exec db pg_dump -U khanz_user khanz_db > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "Backup created in backups/"

# Logs
logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

# Maintenance
collectstatic:
	docker-compose exec backend python manage.py collectstatic --noinput

clean:
	docker-compose down -v
	@echo "All containers and volumes removed"

# Quick start for production
deploy: build up migrate collectstatic
	@echo "Deployment complete!"
	@echo "Don't forget to create a superuser: make superuser"
