# Khanz Restaurant - Frontend

Next.js frontend application for Khanz Restaurant.

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Run development server
npm run dev
```

Visit http://localhost:3000

### Production Build

```bash
npm run build
npm start
```

## 📁 Project Structure

```
frontend/
├── app/              # Next.js app directory (pages)
├── components/       # React components
│   ├── home/        # Home page sections
│   ├── layout/      # Layout components (navbar, footer)
│   └── ui/          # Reusable UI components
├── hooks/           # Custom React hooks
├── lib/             # Utilities and API client
├── public/          # Static assets
├── styles/          # Global styles
└── package.json     # Dependencies
```

## 🛠️ Tech Stack

- **Framework**: Next.js 16
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 🔌 API Integration

The frontend communicates with the Django backend through the API client in `lib/api.ts`.

Configure the API URL in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🐳 Docker

The frontend is containerized and can be run with Docker Compose from the root directory:

```bash
cd ..
docker-compose up frontend
```

## 📄 Environment Variables

See `.env.example` for all available configuration options.
