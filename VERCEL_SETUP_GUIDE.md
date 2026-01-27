# 🔧 Fix Localhost URLs in Vercel - Step by Step

## Problem
Your Vercel app is still generating `http://localhost:3000/paste/[id]` URLs instead of your actual Vercel URL.

## Root Cause
The `NEXT_PUBLIC_APP_URL` environment variable is not set in your Vercel project.

---

## ✅ Solution: Set Environment Variable in Vercel

### Step 1: Go to Vercel Dashboard
1. Open https://vercel.com/dashboard
2. Find your project: **pastebin-lite-app**
3. Click on it to open project settings

### Step 2: Go to Settings
- Look for **"Settings"** tab (usually at the top)
- Or go directly: `https://vercel.com/projects/YOUR-PROJECT-NAME/settings`

### Step 3: Find Environment Variables
- Click on **"Environment Variables"** in the left sidebar
- Or look for: **Settings > Environment Variables**

### Step 4: Add New Environment Variable
Click **"Add Environment Variable"** button

Fill in:
- **Name:** `NEXT_PUBLIC_APP_URL`
- **Value:** `https://YOUR-VERCEL-URL.vercel.app`

**Example:**
- If your app is at: `https://pastebin-lite-app.vercel.app`
- Then set: `NEXT_PUBLIC_APP_URL=https://pastebin-lite-app.vercel.app`

### Step 5: Make Sure It's Available for Production
- Select environments: **✓ Production** (make sure this is checked)
- Also check: **✓ Preview** and **✓ Development** if needed

### Step 6: Save Changes
Click **"Save"** button

### Step 7: Redeploy
After saving, you need to redeploy:
1. Go to **Deployments** tab
2. Click the three dots (**⋯**) on the latest deployment
3. Click **"Redeploy"**

**OR** just push a new commit to trigger automatic redeploy:
```bash
git add .
git commit --allow-empty -m "Trigger Vercel redeploy with env vars"
git push
```

---

## 📸 Visual Guide

### What to look for in Vercel Dashboard:
```
Dashboard > Projects > pastebin-lite-app > Settings > Environment Variables

Then look for:
┌─────────────────────────────────────────────┐
│ Environment Variables                       │
├─────────────────────────────────────────────┤
│ + Add Environment Variable                  │
│                                             │
│ Name: NEXT_PUBLIC_APP_URL                   │
│ Value: https://pastebin-lite-app.vercel.app │
│ ✓ Production ✓ Preview ✓ Development        │
│                                             │
│ [Save]                                      │
└─────────────────────────────────────────────┘
```

---

## ✅ What Your URL Should Be

Find your Vercel URL:
1. Go to Vercel Dashboard
2. Click your project
3. Look at the **Domains** section

It will be something like:
- `https://YOUR-PROJECT-NAME.vercel.app`
- `https://YOUR-PROJECT-NAME-git-main-YOUR-ACCOUNT.vercel.app` (preview)
- Your custom domain if you set one up

---

## 🧪 Test After Redeploy

After redeploy completes:

1. Visit your Vercel URL: `https://pastebin-lite-app.vercel.app`
2. Create a new paste
3. Copy the link
4. **The link should now be:** `https://pastebin-lite-app.vercel.app/paste/[id]`
5. ✅ Not `http://localhost:3000/paste/[id]`

---

## 📋 Quick Checklist

- [ ] Opened Vercel Dashboard
- [ ] Selected your project
- [ ] Went to Settings > Environment Variables
- [ ] Added `NEXT_PUBLIC_APP_URL` variable
- [ ] Set value to your Vercel URL
- [ ] Selected "Production" environment
- [ ] Clicked Save
- [ ] Redeployed the project
- [ ] Tested by creating a paste
- [ ] Verified the link format is correct

---

## 🐛 If Still Not Working

### Check 1: Is the variable actually set?
1. Go to Vercel > Settings > Environment Variables
2. Look for `NEXT_PUBLIC_APP_URL`
3. Verify the value is correct (should start with `https://`)

### Check 2: Did you redeploy?
1. Go to Vercel > Deployments
2. Check the latest deployment status
3. If it shows old time, redeploy manually

### Check 3: Clear browser cache
- Press `Ctrl+Shift+Delete` (or Cmd+Shift+Delete on Mac)
- Clear all cache
- Try again

### Check 4: Check logs
1. Go to Vercel > Deployments > Latest deployment
2. Look at **Function Logs**
3. Search for: `Generated paste URL:`
4. See what URL it shows

---

## 🔍 Debugging

If you want to see what URL is being generated, check your deployment logs:

1. Vercel Dashboard > Deployments
2. Click on latest deployment
3. Look for console output with: `🔗 Generated paste URL:`
4. It will show you exactly what URL was generated

Example output:
```
🔗 Generated paste URL: {
  baseUrl: 'https://pastebin-lite-app.vercel.app',
  pasteUrl: 'https://pastebin-lite-app.vercel.app/paste/abc123',
  vercelUrl: 'pastebin-lite-app.vercel.app',
  nextPublicUrl: 'https://pastebin-lite-app.vercel.app',
  environment: 'production'
}
```

---

## ⚡ Alternative: If you know your custom domain

If you have a custom domain (like `www.mypaste.com`), use:
```
NEXT_PUBLIC_APP_URL=https://www.mypaste.com
```

---

## 💡 Pro Tip

The code will auto-detect the URL in this order:
1. ✅ Uses `NEXT_PUBLIC_APP_URL` if set (recommended)
2. ✅ Uses `VERCEL_URL` environment variable if available
3. ✅ Parses from request URL
4. ❌ Falls back to localhost (this is why you're seeing localhost)

By setting `NEXT_PUBLIC_APP_URL`, we use method #1 which is most reliable.

---

## Summary

**The fix in 3 steps:**
1. Vercel Dashboard > Settings > Environment Variables
2. Add: `NEXT_PUBLIC_APP_URL=https://your-vercel-url.vercel.app`
3. Redeploy

That's it! Your links will now work on production. 🚀
