# 🚀 Vercel Deployment Guide - Pastebin Lite

This is a complete, production-ready Pastebin Lite application optimized for Vercel hosting.

## Project Structure

```
Agenta_Project/                    # Root folder (deploy this entire folder)
├── app/
│   ├── api/                       # Next.js API routes (serverless functions)
│   │   ├── paste/
│   │   │   ├── route.js           # POST /api/paste (create paste)
│   │   │   ├── [id]/
│   │   │   │   └── route.js       # GET /api/paste/[id] (get with decrement)
│   │   │   └── preview/
│   │   │       └── [id]/
│   │   │           └── route.js   # GET /api/paste/preview/[id] (preview)
│   │   └── health/
│   │       └── route.js           # GET /api/health (health check)
│   ├── paste/
│   │   └── [id]/
│   │       └── page.jsx           # Paste viewer page
│   ├── layout.jsx                 # Root layout
│   └── page.jsx                   # Home page
├── lib/
│   ├── db/
│   │   ├── pool.js               # Database connection pool
│   │   ├── schema.js             # Database schema setup
│   │   └── operations.js         # Database queries
│   └── utils/
│       └── helpers.js            # Utility functions
├── public/                        # Static files (optional)
├── .env.local                     # Local environment variables
├── .env.example                   # Example environment variables
├── .vercelrc.json                 # Vercel build configuration
├── next.config.js                 # Next.js configuration
├── package.json                   # Dependencies
└── tsconfig.json                  # TypeScript configuration
```

## ✅ Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **PostgreSQL Database** - Use Vercel Postgres (recommended) or any PostgreSQL service:
   - Vercel Postgres (easiest)
   - Supabase
   - Railway
   - AWS RDS
3. **Git Repository** - Push your code to GitHub, GitLab, or Bitbucket

## 📋 Step-by-Step Deployment

### Step 1: Create Vercel Postgres Database (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create a new project or select existing
3. Go to **Storage** tab
4. Click **Create Database** → Select **Postgres**
5. Click **Create**
6. Copy the `POSTGRES_URL` connection string

### Step 2: Set Environment Variables

1. In Vercel Dashboard, go to your project
2. Go to **Settings** → **Environment Variables**
3. Add the following:

```
POSTGRES_URL = <paste your Postgres URL here>
NEXT_PUBLIC_APP_URL = https://your-project.vercel.app
```

### Step 3: Deploy to Vercel

#### Option A: Deploy with Git (Recommended)

1. Push code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/pastebin-lite.git
git push -u origin main
```

2. In Vercel Dashboard:
   - Click **Add New** → **Project**
   - Select your GitHub repository
   - Click **Import**
   - Environment variables are already set
   - Click **Deploy**

#### Option B: Deploy with Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# For production
vercel --prod
```

#### Option C: Deploy with Vercel Button (if configured)

Click the Deploy button in your README.

### Step 4: Initialize Database Schema

After deployment, run:

```bash
curl https://your-project.vercel.app/api/health
```

This will auto-initialize the database schema on first request.

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local and add your POSTGRES_URL

# Run development server
npm run dev

# Open http://localhost:3000
```

## 📦 Available Endpoints

### Create Paste
```
POST /api/paste
Content-Type: application/json

{
  "content": "Your code here",
  "ttl": 3600,           // Optional: Time to live in seconds
  "view_limit": 5        // Optional: Maximum views allowed
}
```

### Get Paste (with view decrement)
```
GET /api/paste/[id]
```

### Preview Paste (without view decrement)
```
GET /api/paste/preview/[id]
```

### Health Check
```
GET /api/health
```

## 🚨 Important Notes

### Database Connection
- Vercel Postgres handles connection pooling automatically
- No manual connection management needed
- Maximum 20 concurrent connections (free tier)

### Cold Starts
- First request may take 1-2 seconds (serverless cold start)
- Subsequent requests are fast
- Use Keep-Alive headers to prevent unnecessary cold starts

### File Size Limits
- Max request body: 4.5 MB
- Max response body: 6 MB
- Adjust if needed in `vercel.json`

### Build Time
- Typical build: 30-60 seconds
- Monitor in Vercel Dashboard

## 🔒 Security Checklist

- [ ] Environment variables set in Vercel dashboard
- [ ] Database URL never committed to git
- [ ] CORS headers configured if needed
- [ ] Rate limiting implemented (use middleware)
- [ ] Input validation in place
- [ ] HTTPS enforced (automatic on Vercel)

## 📊 Monitoring

1. **Vercel Dashboard**:
   - Deployments tab - Track deployment history
   - Logs tab - View server logs
   - Analytics tab - View traffic and performance

2. **Database**:
   - Vercel Postgres Dashboard - Monitor queries
   - Check connection count and usage

## 🆘 Troubleshooting

### Database Connection Error
```
Error: POSTGRES_URL not found
```
**Solution**: Add `POSTGRES_URL` to Environment Variables in Vercel

### 404 on API Routes
```
GET /api/paste returns 404
```
**Solution**: 
- Check file is named `route.js` (not `route.jsx`)
- API routes must be in `app/api/` directory

### Cold Start Issues
```
Timeout on first request
```
**Solution**:
- Increase function timeout in `vercel.json`
- Optimize database queries
- Add database connection caching

### CORS Errors
```
Access to XMLHttpRequest blocked by CORS
```
**Solution**: Add CORS headers in route.js:
```javascript
const response = NextResponse.json(data);
response.headers.set('Access-Control-Allow-Origin', '*');
return response;
```

## 📈 Performance Tips

1. **Database Queries**:
   - Use indexes (already created)
   - Limit result sets
   - Use parameterized queries (already done)

2. **Serverless Functions**:
   - Keep functions small
   - Use connection pooling
   - Cache frequently accessed data

3. **Frontend**:
   - Enable image optimization
   - Use dynamic imports
   - Compress assets

## 🔄 Continuous Deployment

Every push to main branch automatically:
1. Triggers a new build
2. Runs tests (if configured)
3. Deploys to staging
4. Promotes to production

## 🚀 Next Steps

1. **Add Authentication** (optional):
   - NextAuth.js for user authentication
   - Private pastes with passwords

2. **Add Email Notifications** (optional):
   - SendGrid or Mailgun integration
   - Notify when paste expires

3. **Add Analytics** (optional):
   - Vercel Analytics
   - Segment or Mixpanel

4. **Custom Domain** (optional):
   - Add domain in Vercel Settings
   - HTTPS automatic

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Postgres Docs](https://vercel.com/docs/storage/vercel-postgres)
- [Deployment Guide](https://nextjs.org/learn/basics/deploying-nextjs-app)

## 💬 Support

For issues:
1. Check Vercel dashboard logs
2. Review this guide's Troubleshooting section
3. Visit Vercel documentation
4. Contact Vercel support

---

**Ready to deploy? Push your code and watch the magic happen! 🎉**
