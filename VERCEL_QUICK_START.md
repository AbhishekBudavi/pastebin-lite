# 🚀 Quick Start - Vercel Deployment

## What's New?
Your project is now fully prepared for Vercel hosting! The entire application is packaged in the root folder ready to deploy.

## 📁 Key Locations

```
Agenta_Project/                    ← Deploy THIS ENTIRE folder to Vercel
├── app/                           ← All pages and API routes
│   ├── api/                       ← Serverless API functions
│   ├── paste/[id]/               ← Paste viewer page
│   ├── layout.jsx                ← Root layout
│   └── page.jsx                  ← Home page
├── lib/                           ← Reusable utilities
│   ├── db/                        ← Database code
│   └── utils/                     ← Helper functions
├── package.json                   ← Dependencies (updated for Vercel)
├── .env.example                   ← Copy to .env.local
└── .vercelrc.json                ← Vercel configuration
```

## ⚡ 3-Minute Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
```bash
# Copy example file
cp .env.example .env.local

# Edit .env.local and add:
POSTGRES_URL=your_postgres_url_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Locally
```bash
npm run dev
# Open http://localhost:3000
```

## 🌐 Deploy to Vercel in 2 Steps

### Option 1: GitHub (Recommended)
```bash
# 1. Push to GitHub
git push origin main

# 2. In Vercel Dashboard:
#    - Click "Add New" → "Project"
#    - Select your GitHub repo
#    - Add POSTGRES_URL to Environment Variables
#    - Click Deploy
```

### Option 2: Vercel CLI
```bash
# Install CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Option 3: Drag & Drop
Use Vercel's [dashboard](https://vercel.com/dashboard) to import your GitHub repo directly.

## ✅ What's Included

- ✅ Next.js 14 + React 18
- ✅ API routes (replaces Express)
- ✅ Vercel Postgres ready
- ✅ All features from original project
- ✅ Production-ready code
- ✅ Environment variables configured

## 🗄️ Database Setup

### Option A: Vercel Postgres (Easiest)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Storage**
4. Click **Create Database** → **Postgres**
5. Copy the `POSTGRES_URL`

### Option B: External PostgreSQL
1. Use Supabase, Railway, or AWS RDS
2. Copy the connection URL
3. Add to `.env.local` as `POSTGRES_URL`

## 📊 API Endpoints

All endpoints work the same as before:

```
POST   /api/paste              Create a paste
GET    /api/paste/[id]         Get paste (with view decrement)
GET    /api/paste/preview/[id] Preview paste (without decrement)
GET    /api/health             Health check
```

## 🔍 Check Status

After deployment, verify it's working:
```bash
curl https://your-app.vercel.app/api/health
```

Should return:
```json
{
  "status": "healthy",
  "database": "connected"
}
```

## 📖 Full Guide

See `VERCEL_DEPLOYMENT_GUIDE.md` for detailed instructions on:
- Environment variables
- Database setup
- Troubleshooting
- Performance optimization
- Monitoring
- Custom domains

## ❓ Need Help?

1. **Check logs**: Vercel Dashboard → Deployments → View Logs
2. **Read the guide**: `VERCEL_DEPLOYMENT_GUIDE.md`
3. **Test locally**: `npm run dev`

## 🎯 Next Steps

1. ✅ Update `POSTGRES_URL` in `.env.local`
2. ✅ Run `npm install`
3. ✅ Test with `npm run dev`
4. ✅ Push to GitHub
5. ✅ Deploy via Vercel Dashboard

---

**You're all set! Deploy with confidence.** 🚀
