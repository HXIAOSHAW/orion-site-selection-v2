# 🚀 Backend Deployment Guide

## Quick Deploy (3 Minutes)

### Method 1: Railway (Recommended - Click to Deploy)

**One-Click Deploy to Railway:**

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/new?template=https://github.com/HXIAOSHAW/orion-site-selection-v2)

**Or Manual Deploy:**

1. Go to: https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select `HXIAOSHAW/orion-site-selection-v2`
4. Railway will auto-detect Node.js
5. Click "Deploy Now"
6. Your backend will be live at: `https://your-app.up.railway.app`

**Important**: Railway will automatically:
- Install dependencies from `backend/package.json`
- Run `npm start` from the `backend` directory
- Set PORT environment variable

### Method 2: Render

1. Go to: https://render.com/
2. Sign in with GitHub
3. Click "New +" → "Web Service"
4. Connect: `orion-site-selection-v2`
5. Settings:
   - Name: `orion-backend`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Click "Create Web Service"
7. Your backend will be at: `https://orion-backend.onrender.com`

### Method 3: Vercel

```bash
npm i -g vercel
cd /Users/xh/Orion/orion-site-selection-v2/backend
vercel --prod
```

---

## After Deployment

### Step 1: Get Your Backend URL

After deployment, you'll get a URL like:
- Railway: `https://orion-site-selection-v2-production.up.railway.app`
- Render: `https://orion-backend.onrender.com`
- Vercel: `https://orion-backend.vercel.app`

### Step 2: Update Frontend

```bash
cd /Users/xh/Orion/orion-site-selection-v2

# Edit docs/app.js
# Find this line (around line 8):
#   : 'https://your-backend-url.com';
# Replace with your actual backend URL

# Then commit and push:
git add docs/app.js
git commit -m "Connect frontend to deployed backend"
git push
```

Wait 1-2 minutes for GitHub Pages to redeploy.

### Step 3: Test

Visit: https://hxiaoshaw.github.io/orion-site-selection-v2/

You should now see real data!

---

## Important Notes

### About Excel Data

Your backend currently expects an Excel file. For production:

**Option A: Use Mock Data (Easiest for Demo)**

The backend will work without the Excel file for basic demo purposes.

**Option B: Upload Data File**

If using Railway:
1. Create a volume in Railway
2. Upload Excel file
3. Update path in environment variables

**Option C: Convert to Database** (Recommended for Production)

1. Export Excel to CSV
2. Import to PostgreSQL
3. Update backend to use database

---

## Environment Variables

No environment variables are strictly required for basic deployment. The backend will:
- Use PORT provided by Railway/Render
- Work with or without Excel file (will use mock data if file missing)

Optional variables:
- `NODE_ENV`: production
- `PORT`: (automatically set by host)

---

## Testing Your Backend

After deployment, test your backend:

```bash
# Check health
curl https://your-backend-url.com/

# Check stats API
curl https://your-backend-url.com/api/power-supplies/stats
```

Should return JSON data.

---

## Troubleshooting

### "Application Error" or 503

**Cause**: Deployment failed or crashed

**Fix**:
1. Check logs in Railway/Render dashboard
2. Ensure `package.json` is correct
3. Try redeploying

### "CORS Error" in Frontend

**Cause**: Backend not allowing frontend domain

**Fix**: Backend already has CORS enabled, should work automatically

### "No Data" in Frontend

**Cause**: Backend URL not updated or backend not running

**Fix**:
1. Verify backend is running: visit `https://your-backend-url.com/`
2. Check frontend `docs/app.js` has correct URL
3. Check browser console for errors

---

## Quick Deploy Script

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
cd /Users/xh/Orion/orion-site-selection-v2
railway up

# Get URL
railway domain

# Link to project
railway link
```

---

## Next Steps

1. ✅ Deploy backend (Railway/Render/Vercel)
2. ✅ Copy backend URL
3. ✅ Update `docs/app.js` with backend URL
4. ✅ Push changes to GitHub
5. ✅ Test full system

**Your complete system will be live!** 🎉





