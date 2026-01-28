## Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (or Vercel Postgres)
- Git

### Installation

```bash
# 1. Clone the repository (or use the folder as-is)
cd Agenta_Project

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env.local

# Edit .env.local and add your database URL
```

### Environment Variables

```env
# PostgreSQL connection string
POSTGRES_URL=postgresql://user:password@host:5432/database

# Frontend URL (for sharing paste links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Local Development

```bash
# Start dev server
npm run dev

# Open http://localhost:3000
```

## Deployment

### Deploy to Vercel (30 seconds)

#### Method 1: GitHub (Recommended)
```bash
# Push code to GitHub
git push origin main

# In Vercel Dashboard:
# 1. Click "Add New" → "Project"
# 2. Select your GitHub repository
# 3. Add POSTGRES_URL to Environment Variables
# 4. Click "Deploy"
```

#### Method 2: Vercel CLI
```bash
npm i -g vercel
vercel --prod
```

#### Method 3: Drag & Drop
Go to [Vercel Dashboard](https://vercel.com/dashboard) and import your GitHub repo.

### Database Setup

**Option A: Vercel Postgres** (Recommended)
- Easiest setup
- Automatic scaling
- Built-in backups
- Click: Storage → Create Database → Postgres

**Option B: External PostgreSQL**
- Supabase
- Railway
- AWS RDS
- DigitalOcean

## Documentation

- **[VERCEL_QUICK_START.md](./VERCEL_QUICK_START.md)** - 3-minute setup guide
- **[VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)** - Complete deployment guide with troubleshooting

## Project Structure

```
Agenta_Project/
├── app/
│   ├── api/                          # Next.js API routes
│   │   ├── paste/
│   │   │   ├── route.js             # POST /api/paste
│   │   │   ├── [id]/route.js        # GET /api/paste/[id]
│   │   │   └── preview/[id]/route.js # GET /api/paste/preview/[id]
│   │   └── health/route.js          # GET /api/health
│   ├── paste/[id]/page.jsx          # Paste viewer
│   ├── layout.jsx                   # Root layout
│   └── page.jsx                     # Home page
├── lib/
│   ├── db/
│   │   ├── pool.js                  # Database connection pool
│   │   ├── schema.js                # Schema initialization
│   │   └── operations.js            # Database queries
│   └── utils/
│       └── helpers.js               # Utility functions
├── .env.example                     # Example environment file
├── .vercelrc.json                   # Vercel build config
├── next.config.js                   # Next.js config
├── package.json                     # Dependencies
└── tsconfig.json                    # TypeScript config
```
## API Routes

### Create Paste
```http
POST /api/paste
Content-Type: application/json

{
  "content": "your code here",
  "ttl": 3600,              // Optional: seconds until expiry
  "view_limit": 5           // Optional: max views allowed
}

Response (201):
{
  "id": "abc123xyz",
  "url": "https://yourapp.vercel.app/paste/abc123xyz"
}
```

### Get Paste (with view decrement)
```http
GET /api/paste/[id]

Response (200):
{
  "id": "abc123xyz",
  "content": "your code",
  "remaining_views": 4,
  "expires_at": "2024-01-27T12:00:00Z"
}
```

### Preview Paste (without view decrement)
```http
GET /api/paste/preview/[id]

Response (200):
{
  "id": "abc123xyz",
  "content": "your code",
  "remaining_views": 5,
  "expires_at": "2024-01-27T12:00:00Z"
}
```

### Health Check
```http
GET /api/health

Response (200):
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-01-27T10:30:45Z"
}
```
