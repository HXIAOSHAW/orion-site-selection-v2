# Backup & Deployment Guide

## Overview

This project includes a comprehensive backup and deployment system that makes it easy to:
- Create complete backups
- Restore to any version
- Deploy to new environments quickly

## Quick Start

### Create a Backup

```bash
cd /Users/xh/Orion/orion-site-selection-v2
./backup.sh
```

This will create:
- A folder with all necessary files
- A compressed `.tar.gz` archive
- Deployment and restore scripts

### Deploy from Backup

**Option 1: Quick Deploy (Same Location)**
```bash
tar -xzf orion-site-selection-v2_backup_YYYYMMDD_HHMMSS.tar.gz
cd orion-site-selection-v2_backup_YYYYMMDD_HHMMSS
./deploy.sh
./start.sh
```

**Option 2: Deploy to Specific Location**
```bash
tar -xzf orion-site-selection-v2_backup_YYYYMMDD_HHMMSS.tar.gz
cd orion-site-selection-v2_backup_YYYYMMDD_HHMMSS
./restore.sh /path/to/target/directory
cd /path/to/target/directory
./deploy.sh
./start.sh
```

## Backup Contents

Each backup includes:

### Application Files
- ✅ Backend (server.js, package.json)
- ✅ Frontend (index.html, app.js, styles.css)
- ✅ Documentation (README, guides)
- ✅ Scripts (start.sh, backup.sh)

### Deployment Scripts
- ✅ `deploy.sh` - Installs dependencies
- ✅ `restore.sh` - Copies files to target location
- ✅ `start.sh` - Starts the application

### Documentation
- ✅ `DEPLOYMENT.md` - Detailed deployment instructions
- ✅ `VERSION.txt` - Backup information and date

## Backup Location

Backups are stored in:
```
/Users/xh/Orion/orion-backups/
```

Each backup has:
- **Folder**: `orion-site-selection-v2_backup_YYYYMMDD_HHMMSS/`
- **Archive**: `orion-site-selection-v2_backup_YYYYMMDD_HHMMSS.tar.gz`

## Deployment Scenarios

### Scenario 1: New Server/Machine

1. Copy the backup archive to the new machine
2. Extract and deploy:
   ```bash
   tar -xzf orion-site-selection-v2_backup_*.tar.gz
   cd orion-site-selection-v2_backup_*
   ./deploy.sh
   ```
3. Update configuration if needed (see Configuration section)
4. Start the application:
   ```bash
   ./start.sh
   ```

### Scenario 2: Restore Previous Version

1. Find the backup you want to restore:
   ```bash
   ls -la /Users/xh/Orion/orion-backups/
   ```
2. Use the restore script:
   ```bash
   cd /Users/xh/Orion/orion-backups/orion-site-selection-v2_backup_*
   ./restore.sh /Users/xh/Orion/orion-site-selection-v2
   cd /Users/xh/Orion/orion-site-selection-v2
   ./deploy.sh
   ./start.sh
   ```

### Scenario 3: Share with Team

1. Create a backup:
   ```bash
   ./backup.sh
   ```
2. Share the `.tar.gz` file with your team
3. Team members extract and deploy:
   ```bash
   tar -xzf orion-site-selection-v2_backup_*.tar.gz
   cd orion-site-selection-v2_backup_*
   ./deploy.sh
   ./start.sh
   ```

## Configuration After Deployment

### Required: Excel Data File

The application needs the Excel data file. After deployment, update the path in `backend/server.js`:

```javascript
const EXCEL_FILE_PATH = path.join(__dirname, 'path/to/ukpn-secondary-sites.xlsx');
```

### Optional: Change Password

Edit `frontend/app.js`:
```javascript
const CONFIG = {
  PASSWORD: 'YourNewPassword',
  // ...
};
```

### Optional: Change Ports

**Backend** - Edit `backend/server.js`:
```javascript
const PORT = process.env.PORT || 3000;
```

**Frontend** - When starting:
```bash
python3 -m http.server 8888  # Use any port
```

### Optional: Update Google Maps API Key

Edit `frontend/app.js`:
```javascript
const GOOGLE_MAPS_API_KEY = 'YOUR_NEW_API_KEY';
```

## Prerequisites for New Environments

Ensure the following are installed:
- **Node.js** (v14 or higher) - https://nodejs.org/
- **Python 3** (for frontend server)
- **Excel data file** - `ukpn-secondary-sites.xlsx`

### Check Prerequisites

```bash
node --version    # Should show v14 or higher
npm --version     # Should show 6 or higher
python3 --version # Should show 3.x
```

## Troubleshooting

### Backup Failed
- Check disk space: `df -h`
- Ensure write permissions: `ls -la ../orion-backups`

### Deployment Failed
- Ensure Node.js is installed: `node --version`
- Check npm: `npm --version`
- Try manual install: `cd backend && npm install`

### Application Won't Start
- Check if ports are in use:
  ```bash
  lsof -i :3000  # Backend
  lsof -i :8080  # Frontend
  ```
- Check backend logs in the terminal
- Verify Excel file path in `backend/server.js`

### Data Not Loading
- Verify Excel file path in `backend/server.js`
- Check backend terminal for errors
- Test API: `curl http://localhost:3000/api/power-supplies/stats`

## Backup Best Practices

1. **Regular Backups**: Create backups before making major changes
2. **Version Control**: Keep multiple backup versions
3. **Off-site Storage**: Copy important backups to cloud storage or external drives
4. **Test Restores**: Periodically test that backups can be restored
5. **Document Changes**: Note any configuration changes made after deployment

## Archive Management

### List All Backups
```bash
ls -lht /Users/xh/Orion/orion-backups/*.tar.gz
```

### View Backup Contents
```bash
tar -tzf orion-site-selection-v2_backup_*.tar.gz
```

### Delete Old Backups
```bash
# Keep only the 5 most recent backups
cd /Users/xh/Orion/orion-backups
ls -t *.tar.gz | tail -n +6 | xargs rm
```

## Support

For issues or questions:
1. Check the `DEPLOYMENT.md` file in the backup
2. Review `VERSION.txt` for backup information
3. Check application logs in terminal

---

**Note**: The backup system automatically excludes `node_modules` to keep archive size small. Dependencies are installed during deployment via `npm install`.




