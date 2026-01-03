# Deploy to GitHub Guide

## 🚀 Quick Deploy Steps

### Step 1: Create GitHub Repository

1. Go to https://github.com/HXIAOSHAW
2. Click "New Repository"
3. Repository name: `orion-site-selection-v2`
4. Description: "Simplified Orion Site Selection System v2"
5. Set to **Public** (required for free GitHub Pages)
6. **DO NOT** initialize with README
7. Click "Create repository"

### Step 2: Push Code to GitHub

```bash
cd /Users/xh/Orion/orion-site-selection-v2

# Add all files
git add .

# Commit
git commit -m "Initial commit: Simplified Orion Site Selection v2"

# Add remote
git remote add origin https://github.com/HXIAOSHAW/orion-site-selection-v2.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository: https://github.com/HXIAOSHAW/orion-site-selection-v2
2. Click "Settings" tab
3. Click "Pages" in left sidebar
4. Under "Source":
   - Branch: `main`
   - Folder: `/frontend`
5. Click "Save"
6. Wait 1-2 minutes for deployment
7. Your site will be at: `https://hxiaoshaw.github.io/orion-site-selection-v2/`

---

## 🔧 Backend Deployment

### Option 1: Railway (Recommended - Free Tier Available)

1. Go to https://railway.app/
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select `orion-site-selection-v2`
5. Set root directory: `backend`
6. Railway will auto-detect Node.js
7. Add environment variables:
   - `PORT`: 3000
   - `NODE_ENV`: production
8. Deploy!
9. Copy the public URL (e.g., `https://your-app.up.railway.app`)

### Option 2: Render (Free Tier)

1. Go to https://render.com/
2. Sign in with GitHub
3. Click "New" → "Web Service"
4. Connect your repository
5. Settings:
   - Name: `orion-site-selection-backend`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Add environment variables
7. Deploy!

### Option 3: Heroku

1. Go to https://www.heroku.com/
2. Create new app
3. Connect GitHub repository
4. Set root to `backend`
5. Deploy

---

## 🔗 Connect Frontend to Backend

After deploying backend, update the frontend:

1. Edit `frontend/app.js`:
   ```javascript
   const API_BASE_URL = isLocalhost 
     ? 'http://localhost:3000'
     : 'https://YOUR-BACKEND-URL.com';  // ← Replace with your deployed backend URL
   ```

2. Commit and push:
   ```bash
   git add frontend/app.js
   git commit -m "Update backend URL for production"
   git push
   ```

3. GitHub Pages will auto-redeploy (1-2 minutes)

---

## 📋 Required Files for Deployment

### Backend (`backend/`)
- ✅ `package.json` - Dependencies
- ✅ `server.js` - Main server file
- ⚠️ `.env` - Environment variables (create this)

### Frontend (`frontend/`)
- ✅ `index.html` - Main HTML
- ✅ `app.js` - Main JavaScript
- ✅ `styles.css` - Styles

---

## 🔐 Environment Variables for Backend

Create `backend/.env`:

```env
PORT=3000
NODE_ENV=production
EXCEL_FILE_PATH=../database/power/data/ukpn-secondary-sites.xlsx
```

**Note**: You'll need to upload the Excel file to your backend deployment or use a cloud storage solution.

---

## 📊 Excel Data Handling

The backend needs the Excel file. Options:

### Option 1: Include in Repository (Simple)
```bash
# Make sure Excel file is NOT in .gitignore
git add backend/data/ukpn-secondary-sites.xlsx
git commit -m "Add data file"
git push
```

### Option 2: Cloud Storage (Recommended for large files)
- Upload to AWS S3, Google Cloud Storage, or Azure Blob
- Update backend to fetch from cloud URL

### Option 3: Database Migration
- Convert Excel data to PostgreSQL/MySQL
- Update backend to use database

---

## 🧪 Test Deployment

After deployment:

1. **Test Frontend**:
   - Visit: `https://hxiaoshaw.github.io/orion-site-selection-v2/`
   - Enter password: `EdgeNebula2026`
   - Check if login works

2. **Test Backend**:
   - Visit: `https://your-backend-url.com/api/power-supplies/stats`
   - Should return JSON data

3. **Test Integration**:
   - Login to frontend
   - Go to Dashboard
   - Check if data loads (should see statistics)

---

## 🔒 Security Notes

1. **Password Protection**:
   - Current: Client-side (basic)
   - For production: Consider backend authentication

2. **API Keys**:
   - Store in environment variables
   - Never commit `.env` files

3. **CORS**:
   - Backend already configured with CORS
   - Update if needed for your domain

---

## 📝 Post-Deployment Checklist

- [ ] Repository created on GitHub
- [ ] Code pushed to `main` branch
- [ ] GitHub Pages enabled
- [ ] Frontend accessible at GitHub Pages URL
- [ ] Backend deployed (Railway/Render/Heroku)
- [ ] Backend URL updated in `frontend/app.js`
- [ ] Changes pushed and redeployed
- [ ] Frontend can connect to backend
- [ ] Dashboard shows data
- [ ] Maps work correctly
- [ ] All pages functional

---

## 🆘 Troubleshooting

### Frontend shows "Failed to fetch"

**Cause**: Backend not running or CORS issue

**Fix**:
1. Check backend is running: `curl https://your-backend-url.com/api/power-supplies/stats`
2. Check CORS settings in `backend/server.js`
3. Ensure API_BASE_URL is correct in `frontend/app.js`

### GitHub Pages not updating

**Cause**: Deployment delay or cache

**Fix**:
1. Wait 2-3 minutes after push
2. Hard refresh: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)
3. Check deployment status in GitHub → Settings → Pages

### Backend crashes after deploy

**Cause**: Missing dependencies or environment variables

**Fix**:
1. Check logs in your deployment platform
2. Ensure all environment variables are set
3. Verify Excel file path is correct

---

## 🎉 Success!

Your site should now be live at:
- **Frontend**: `https://hxiaoshaw.github.io/orion-site-selection-v2/`
- **Backend**: `https://your-backend-url.com/`

Share the frontend URL with anyone to give them access (they'll need the password).

---

## 🔄 Future Updates

To update the site:

```bash
# Make changes to code
git add .
git commit -m "Description of changes"
git push

# GitHub Pages will auto-redeploy
```

---

**Note**: For the Excel data file, you may need to handle it separately as it's large. Consider using cloud storage or converting to a database for production use.

