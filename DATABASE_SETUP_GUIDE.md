# 🗄️ DATABASE SETUP FOR THIS PROJECT - Step-by-Step

This guide specifically covers setting up PostgreSQL database for the **Pastebin Lite** project in Vercel.

---

## 📊 What Your Project Needs

Your project uses:
- **Next.js 14** (frontend + API)
- **PostgreSQL** database (store pastes)
- **Vercel** deployment platform

The database stores:
- Paste content
- Expiration times
- View limits
- View tracking

---

## 🎯 Two Database Options

### Option 1: Vercel Postgres (EASIEST - Recommended for beginners) ⭐
- Free tier available
- No separate account needed
- Integrated with Vercel dashboard
- Auto-backups included

### Option 2: Neon (Free PostgreSQL)
- Generous free tier
- Works anywhere
- Requires separate account
- Good alternative if Vercel unavailable

**We'll use Option 1 (Vercel Postgres)** - it's simplest!

---

## 📋 PART 1: Create Database in Vercel

### Step 1: Go to Vercel Dashboard

1. Open https://vercel.com/dashboard
2. Login with your GitHub account
3. You should see your projects listed

### Step 2: Navigate to Storage

1. Click on your **pastebin-lite-app** project
2. Click **"Storage"** tab (next to "Deployments")

**Screenshot location:** Top navigation bar

### Step 3: Create Database

1. Click **"Create"** button
2. Click **"Database"**
3. Select **"Postgres"**

### Step 4: Configure Database

A form appears with options:

```
Database Name:     pastebin_lite
Location/Region:   us-east-1  (or closest to you)
Billing Cycle:     Pay as you go
```

**Important: Choose a region:**
- `us-east-1` → USA East Coast
- `eu-west-1` → Europe
- `ap-northeast-1` → Asia Pacific

Choose closest to your location for best speed!

### Step 5: Accept & Create

1. Scroll down
2. Check the checkbox for terms
3. Click **"Create & Continue"**

⏳ Wait 2-3 minutes for database creation...

✅ **Success!** Database is created!

---

## 🔑 PART 2: Get Your POSTGRES_URL

### Step 6: Copy Connection String

After creation, you'll see a screen like this:

```
Postgres Database Created!

DATABASE_URL:
postgresql://default:your_password_here@db-name.postgres.vercel.sh:5432/verceldb?sslmode=require

.env.local:
DATABASE_URL=postgresql://default:your_password_here@db-name.postgres.vercel.sh:5432/verceldb?sslmode=require
```

### Step 7: Copy the Full Connection String

1. Look for **"DATABASE_URL"** or **".env.local"** section
2. Click **"Copy"** button (you'll see it on the right)
3. The full string gets copied to your clipboard

It looks like:
```
postgresql://username:password@hostname:5432/database?sslmode=require
```

**Important:** This is your password! Keep it SECRET! Don't share it anywhere!

---

## 🔐 PART 3: Add Environment Variable to Vercel

### Step 8: Go to Project Settings

1. Still in Vercel dashboard
2. Click **"Settings"** tab (top navigation)
3. Click **"Environment Variables"** (left sidebar)

### Step 9: Add POSTGRES_URL Variable

Click **"Add New"** button:

```
Name:           POSTGRES_URL
Value:          [Paste the full connection string you copied]
Environments:   ✓ Production
                ✓ Preview
                ✓ Development
```

**Important:** Select ALL three environments!

### Step 10: Save Variable

1. Click **"Save"** button
2. Variable is now saved ✅

### Step 11: Add App URL Variable (Optional but Recommended)

Add another variable:

```
Name:           NEXT_PUBLIC_APP_URL
Value:          https://your-project-name.vercel.app
Environments:   ✓ Production
                ✓ Preview
                ✓ Development
```

Click **"Save"**

---

## 🚀 PART 4: Redeploy with Variables

### Step 12: Trigger Redeploy

1. Click **"Deployments"** tab
2. Find your latest deployment
3. Click the three dots (**...**) menu
4. Select **"Redeploy"**
5. Click **"Redeploy"** to confirm

⏳ Wait for the build to complete (2-3 minutes)

✅ **When you see "Ready"** - Deployment successful!

---

## ✅ PART 5: Verify Database is Working

### Step 13: Test Health Endpoint

Open in your browser:

```
https://your-project-name.vercel.app/api/health
```

You should see:

```json
{
  "status": "healthy",
  "database": "connected"
}
```

**If you see this** - Database is working! ✅

### Step 14: Test Creating a Paste

1. Go to: `https://your-project-name.vercel.app`
2. Paste some code
3. Click **"Create Paste"**
4. If it works, you should see a success message

**Congratulations! Database is set up!** 🎉

---

## 🗃️ What Gets Created in Your Database

When your app runs, it automatically creates these tables:

### Table 1: **pastes**
```sql
id (string)              - Unique paste ID
content (text)           - The code/text pasted
created_at (timestamp)   - When it was created
expires_at (timestamp)   - When it expires
view_limit (number)      - Max views allowed
views_remaining (number) - Views left
```

### Table 2: **paste_views**
```sql
id (number)        - Record ID
paste_id (string)  - Which paste was viewed
viewed_at (timestamp) - When it was viewed
```

**These are created automatically!** You don't need to create them manually.

---

## 🔍 How Your Project Uses the Database

### File: `lib/db/pool.js`
```javascript
import { sql } from '@vercel/postgres';

export async function query(queryString, params = []) {
  // Reads POSTGRES_URL automatically
  let result = await sql.unsafe(queryString, params);
  return { rows: result.rows };
}
```

**This code:**
1. Imports the `@vercel/postgres` package
2. Reads the `POSTGRES_URL` environment variable
3. Executes database queries

### File: `lib/db/operations.js`
```javascript
export async function createPaste(pasteId, content, expiresAt, viewLimit) {
  const result = await query(
    `INSERT INTO pastes (...) VALUES (...)`,
    [pasteId, content, expiresAt, viewLimit]
  );
  return result.rows[0];
}
```

**This code:**
1. Calls the `query` function
2. Inserts paste into database
3. Returns the created paste

### File: `app/api/paste/route.js`
```javascript
export async function POST(request) {
  const { content, ttl, view_limit } = await request.json();
  
  // Creates paste in database
  const result = await createPaste(pasteId, content, expiresAt, viewLimit);
  
  return NextResponse.json({ id: result.id });
}
```

**This code:**
1. Receives paste data from user
2. Calls `createPaste` function
3. Returns the paste URL

---

## 📊 Data Flow

```
User creates paste
    ↓
POST /api/paste (app/api/paste/route.js)
    ↓
createPaste() function (lib/db/operations.js)
    ↓
query() function (lib/db/pool.js)
    ↓
POSTGRES_URL environment variable
    ↓
Vercel Postgres Database
    ↓
Data saved! ✅
    ↓
Return paste URL to user
```

---

## 🆘 Troubleshooting

### "POSTGRES_URL is not set"
**Problem:** Environment variable not added

**Solution:**
1. Go to Vercel Settings → Environment Variables
2. Check if `POSTGRES_URL` exists
3. If not, add it again
4. **Redeploy** the project

### "Failed to connect to database"
**Problem:** Wrong connection string or database offline

**Solution:**
1. Copy fresh connection string from Vercel Storage tab
2. Update the variable
3. Redeploy

### "Cannot find module '@vercel/postgres'"
**Problem:** Package not installed

**Solution:** 
This shouldn't happen because `package.json` already includes it. If it does:
```powershell
npm install @vercel/postgres
```

### Health check returns "database": "disconnected"
**Problem:** POSTGRES_URL not configured correctly

**Solution:**
1. Verify POSTGRES_URL is in Environment Variables
2. Verify all 3 environments are selected (Production, Preview, Development)
3. Redeploy after making changes
4. Wait 5 minutes before testing again

---

## 🔐 Security Best Practices

✅ **DO:**
- Keep POSTGRES_URL secret
- Use Vercel environment variables (not hardcoded)
- Rotate passwords periodically
- Use strong passwords

❌ **DON'T:**
- Share your POSTGRES_URL with anyone
- Commit connection strings to Git
- Post screenshots with URLs visible
- Use weak passwords

---

## 📈 Monitor Your Database

### In Vercel Dashboard:

1. Go to **Storage** tab
2. Click your database name
3. You can see:
   - Database size
   - Connection info
   - Backups
   - Metrics

---

## 🎯 Quick Reference Checklist

When setting up database for THIS project:

- [ ] Created Vercel Postgres database
- [ ] Copied POSTGRES_URL connection string
- [ ] Added POSTGRES_URL to Vercel Environment Variables
- [ ] Selected all 3 environments (Production, Preview, Development)
- [ ] Added NEXT_PUBLIC_APP_URL variable
- [ ] Redeployed the project
- [ ] Tested /api/health endpoint
- [ ] Tested creating a paste
- [ ] Verified paste data appears in database

---

## 📞 Need Help?

**Common Links:**
- Vercel Docs: https://vercel.com/docs/storage/postgres
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Next.js Docs: https://nextjs.org/docs

---

**Your database is now connected to your Vercel deployment!** 🚀

The connection happens automatically through the `POSTGRES_URL` environment variable. Your app reads it when it starts, and all database operations use it automatically.

No code changes needed - it just works! ✨
