# 📦 Backup System Instructions

## ✅ Backup Complete!

Your application has been successfully backed up!

### Backup Location
```
/Users/xh/Orion/orion-backups/
```

### What Was Backed Up?

✅ **Backend Code**
- server.js (12.8 KB)
- package.json
- package-lock.json
- README.md

✅ **Frontend Code**
- index.html
- app.js (29 KB)
- styles.css (11 KB)
- README.md

✅ **Documentation**
- README.md
- QUICKSTART.md
- TEST.md
- DEPLOYMENT.md
- VERSION.txt

✅ **Scripts**
- start.sh (one-click startup)
- deploy.sh (automatic deployment)
- restore.sh (restore to specific location)
- backup.sh (create new backups)

### Archive Details
- **File**: `orion-site-selection-v2_backup_20260103_191414.tar.gz`
- **Size**: 27 KB
- **Format**: Compressed tar archive
- **Date**: January 3, 2026

---

## 🚀 Quick Commands

### Create New Backup
```bash
cd /Users/xh/Orion/orion-site-selection-v2
./backup.sh
```

### Deploy from Backup (Same Machine)
```bash
cd /Users/xh/Orion/orion-backups
tar -xzf orion-site-selection-v2_backup_20260103_191414.tar.gz
cd orion-site-selection-v2_backup_20260103_191414
./deploy.sh
./start.sh
```

### Deploy to New Location
```bash
cd /Users/xh/Orion/orion-backups
tar -xzf orion-site-selection-v2_backup_20260103_191414.tar.gz
cd orion-site-selection-v2_backup_20260103_191414
./restore.sh ~/Desktop/orion-new
cd ~/Desktop/orion-new
./deploy.sh
./start.sh
```

### Share with Colleague
```bash
# Copy the archive file
cp /Users/xh/Orion/orion-backups/orion-site-selection-v2_backup_*.tar.gz ~/Desktop/

# Send them the file with these instructions:
# 1. tar -xzf orion-site-selection-v2_backup_*.tar.gz
# 2. cd orion-site-selection-v2_backup_*
# 3. ./deploy.sh
# 4. ./start.sh
# 5. Open http://localhost:8080 (Password: EdgeNebula2026)
```

---

## 🌍 Deploy to New Environment

### Prerequisites Checklist
- [ ] Node.js installed (v14+)
- [ ] Python 3 installed
- [ ] Excel data file available

### Step-by-Step

1. **Transfer the backup**
   ```bash
   # Copy the .tar.gz file to new machine
   scp orion-site-selection-v2_backup_*.tar.gz user@newserver:~/
   ```

2. **Extract on new machine**
   ```bash
   tar -xzf orion-site-selection-v2_backup_*.tar.gz
   cd orion-site-selection-v2_backup_*
   ```

3. **Deploy**
   ```bash
   ./deploy.sh
   ```

4. **Configure data path**
   Edit `backend/server.js` and update:
   ```javascript
   const EXCEL_FILE_PATH = path.join(__dirname, '../path/to/ukpn-secondary-sites.xlsx');
   ```

5. **Start**
   ```bash
   ./start.sh
   ```

6. **Access**
   - Open browser: http://localhost:8080
   - Password: EdgeNebula2026

---

## 🔄 Restore Previous Version

If you need to go back to this version later:

```bash
cd /Users/xh/Orion/orion-backups/orion-site-selection-v2_backup_20260103_191414
./restore.sh /Users/xh/Orion/orion-site-selection-v2
cd /Users/xh/Orion/orion-site-selection-v2
./deploy.sh
./start.sh
```

---

## 📋 What's Included in Each Backup

### Application Code
- Complete frontend (HTML, JS, CSS)
- Complete backend (Node.js server)
- All necessary dependencies defined

### Deployment Tools
- **deploy.sh**: Installs npm packages automatically
- **start.sh**: Starts both backend and frontend
- **restore.sh**: Copies files to target directory
- **backup.sh**: Creates new backup

### Documentation
- Quick start guide
- Deployment instructions
- Testing guide
- Version information

---

## 💡 Common Use Cases

### Use Case 1: Development Backup
Before making major changes:
```bash
./backup.sh
# Make your changes
# If something breaks, restore from backup
```

### Use Case 2: Production Deployment
```bash
# On your machine:
./backup.sh
scp /Users/xh/Orion/orion-backups/*.tar.gz user@prod-server:~/

# On production server:
tar -xzf orion-site-selection-v2_backup_*.tar.gz
cd orion-site-selection-v2_backup_*
./deploy.sh
./start.sh
```

### Use Case 3: Team Sharing
```bash
# Create backup
./backup.sh

# Share the .tar.gz file via:
# - Email
# - Dropbox
# - Google Drive
# - USB drive

# Team member extracts and deploys:
# tar -xzf filename.tar.gz
# cd extracted-folder
# ./deploy.sh
# ./start.sh
```

---

## 🛠️ Configuration After Deploy

### Required Configuration

**1. Excel Data File Path**

Edit `backend/server.js`:
```javascript
// Update this line:
const EXCEL_FILE_PATH = path.join(__dirname, '../../orion-site-selection-frontend/database/power/data/ukpn-secondary-sites.xlsx');
```

### Optional Configuration

**2. Change Password**

Edit `frontend/app.js`:
```javascript
const CONFIG = {
  PASSWORD: 'YourNewPassword',
  // ...
};
```

**3. Change Backend Port**

Edit `backend/server.js`:
```javascript
const PORT = process.env.PORT || 3001;  // Change 3000 to any port
```

**4. Change Frontend Port**

When starting:
```bash
cd frontend
python3 -m http.server 8888  # Use any available port
```

**5. Update API Base URL (if ports changed)**

Edit `frontend/app.js`:
```javascript
const CONFIG = {
  API_BASE: 'http://localhost:3001',  // Match backend port
  // ...
};
```

---

## 📊 Verify Backup Integrity

### Check Archive Contents
```bash
tar -tzf orion-site-selection-v2_backup_*.tar.gz | head -20
```

### Check Archive Size
```bash
ls -lh /Users/xh/Orion/orion-backups/*.tar.gz
```

### Test Restore
```bash
# Create a test directory
mkdir -p ~/test-restore
cd /Users/xh/Orion/orion-backups/orion-site-selection-v2_backup_*
./restore.sh ~/test-restore
cd ~/test-restore
./deploy.sh

# If successful, clean up
cd ~
rm -rf ~/test-restore
```

---

## 🆘 Troubleshooting

### Backup Command Not Found
```bash
chmod +x /Users/xh/Orion/orion-site-selection-v2/backup.sh
```

### Deployment Fails - npm not found
```bash
# Install Node.js from https://nodejs.org/
node --version  # Verify installation
```

### Port Already in Use
```bash
# Find what's using the port
lsof -i :3000  # Backend
lsof -i :8080  # Frontend

# Kill the process or change ports
```

### Cannot Find Excel File
```bash
# Verify file exists
ls -la /path/to/ukpn-secondary-sites.xlsx

# Update path in backend/server.js
```

---

## 📚 Additional Resources

- **Full Backup Guide**: See `BACKUP_README.md`
- **Quick Start**: See `QUICKSTART.md`
- **Testing Guide**: See `TEST.md`
- **Deployment Details**: See `DEPLOYMENT.md` (in backup)

---

**Remember**: Each backup is independent and complete. You can deploy any backup at any time without affecting other versions!





