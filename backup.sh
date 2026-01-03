#!/bin/bash

# Orion Site Selection v2 - Backup Script
# Creates a complete backup of the application

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKUP_DIR="$SCRIPT_DIR/../orion-backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="orion-site-selection-v2_backup_$TIMESTAMP"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"

echo "=========================================="
echo "  Orion Site Selection v2 - Backup"
echo "=========================================="
echo ""
echo "Creating backup: $BACKUP_NAME"
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Create the backup folder
mkdir -p "$BACKUP_PATH"

# Copy all necessary files
echo "Copying files..."

# Copy backend (excluding node_modules)
mkdir -p "$BACKUP_PATH/backend"
cp "$SCRIPT_DIR/backend/package.json" "$BACKUP_PATH/backend/"
cp "$SCRIPT_DIR/backend/package-lock.json" "$BACKUP_PATH/backend/"
cp "$SCRIPT_DIR/backend/server.js" "$BACKUP_PATH/backend/"
cp "$SCRIPT_DIR/backend/README.md" "$BACKUP_PATH/backend/"

# Copy frontend
mkdir -p "$BACKUP_PATH/frontend"
cp "$SCRIPT_DIR/frontend/index.html" "$BACKUP_PATH/frontend/"
cp "$SCRIPT_DIR/frontend/app.js" "$BACKUP_PATH/frontend/"
cp "$SCRIPT_DIR/frontend/styles.css" "$BACKUP_PATH/frontend/"
cp "$SCRIPT_DIR/frontend/README.md" "$BACKUP_PATH/frontend/"

# Copy root files
cp "$SCRIPT_DIR/README.md" "$BACKUP_PATH/" 2>/dev/null || true
cp "$SCRIPT_DIR/QUICKSTART.md" "$BACKUP_PATH/" 2>/dev/null || true
cp "$SCRIPT_DIR/TEST.md" "$BACKUP_PATH/" 2>/dev/null || true
cp "$SCRIPT_DIR/start.sh" "$BACKUP_PATH/"
chmod +x "$BACKUP_PATH/start.sh"

# Copy this backup script
cp "$SCRIPT_DIR/backup.sh" "$BACKUP_PATH/"
chmod +x "$BACKUP_PATH/backup.sh"

# Create a deployment guide
cat > "$BACKUP_PATH/DEPLOYMENT.md" << 'EOF'
# Deployment Guide

## Quick Deployment

1. Extract this backup to your desired location
2. Run the deployment script:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

## Manual Deployment

### Prerequisites
- Node.js (v14 or higher)
- Python 3
- Excel data file: `ukpn-secondary-sites.xlsx`

### Step 1: Setup Backend
```bash
cd backend
npm install
```

### Step 2: Configure Data Path
Edit `backend/server.js` and update the Excel file path:
```javascript
const EXCEL_FILE_PATH = path.join(__dirname, 'path/to/ukpn-secondary-sites.xlsx');
```

### Step 3: Start Application
```bash
# From the project root
./start.sh
```

Or manually:
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
python3 -m http.server 8080
```

### Step 4: Access Application
- URL: http://localhost:8080
- Password: EdgeNebula2026

## Configuration

### Change Password
Edit `frontend/app.js`:
```javascript
const CONFIG = {
  API_BASE: 'http://localhost:3000',
  PASSWORD: 'YourNewPassword',
  STORAGE_KEY: 'orion_access_granted'
};
```

### Change Ports
- Backend: Edit `backend/server.js`, change `PORT = 3000`
- Frontend: Use `python3 -m http.server [PORT]`

### Update Google Maps API Key
Edit `frontend/app.js`:
```javascript
const GOOGLE_MAPS_API_KEY = 'YOUR_API_KEY_HERE';
```

## Notes
- Backup created: $(date)
- Version: v2 Simplified
- Backend: Node.js + Express
- Frontend: Vanilla JavaScript
EOF

# Create deployment script
cat > "$BACKUP_PATH/deploy.sh" << 'EOF'
#!/bin/bash

echo "=========================================="
echo "  Orion Site Selection v2 - Deployment"
echo "=========================================="
echo ""

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Install backend dependencies
echo "Installing backend dependencies..."
cd "$SCRIPT_DIR/backend"
npm install

if [ $? -eq 0 ]; then
    echo "✓ Backend dependencies installed successfully"
else
    echo "✗ Failed to install backend dependencies"
    exit 1
fi

echo ""
echo "=========================================="
echo "  Deployment Complete!"
echo "=========================================="
echo ""
echo "To start the application:"
echo "  cd $SCRIPT_DIR"
echo "  ./start.sh"
echo ""
echo "Or manually:"
echo "  Terminal 1: cd backend && npm start"
echo "  Terminal 2: cd frontend && python3 -m http.server 8080"
echo ""
echo "Access: http://localhost:8080"
echo "Password: EdgeNebula2026"
echo ""
EOF

chmod +x "$BACKUP_PATH/deploy.sh"

# Create restore script
cat > "$BACKUP_PATH/restore.sh" << EOF
#!/bin/bash

echo "=========================================="
echo "  Orion Site Selection v2 - Restore"
echo "=========================================="
echo ""

TARGET_DIR="\$1"

if [ -z "\$TARGET_DIR" ]; then
    echo "Usage: ./restore.sh <target_directory>"
    echo ""
    echo "Example: ./restore.sh /Users/username/Projects/orion-site-selection-v2"
    exit 1
fi

echo "Restoring to: \$TARGET_DIR"
echo ""

# Create target directory
mkdir -p "\$TARGET_DIR"

# Copy all files
cp -r backend "\$TARGET_DIR/"
cp -r frontend "\$TARGET_DIR/"
cp *.md "\$TARGET_DIR/" 2>/dev/null || true
cp *.sh "\$TARGET_DIR/"

cd "\$TARGET_DIR"
chmod +x *.sh

echo ""
echo "✓ Restore complete!"
echo ""
echo "Next steps:"
echo "  cd \$TARGET_DIR"
echo "  ./deploy.sh"
echo ""
EOF

chmod +x "$BACKUP_PATH/restore.sh"

# Create a version info file
cat > "$BACKUP_PATH/VERSION.txt" << EOF
Orion Site Selection v2 - Simplified Version
Backup Date: $(date)
Backup Name: $BACKUP_NAME

Contents:
- Backend (Node.js + Express)
- Frontend (Vanilla JavaScript)
- Documentation
- Deployment scripts

Features:
- Dashboard with statistics
- Site List with search
- Power Analysis with Google Maps
- Site Map visualization
- Selection Criteria configuration
- Password protection
- Real-time data from Excel file

Configuration:
- Backend Port: 3000
- Frontend Port: 8080
- Password: EdgeNebula2026
EOF

# Create archive
echo ""
echo "Creating archive..."
cd "$BACKUP_DIR"
tar -czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME"

if [ $? -eq 0 ]; then
    echo "✓ Archive created: ${BACKUP_NAME}.tar.gz"
    ARCHIVE_SIZE=$(du -h "${BACKUP_NAME}.tar.gz" | cut -f1)
    echo "  Size: $ARCHIVE_SIZE"
fi

echo ""
echo "=========================================="
echo "  Backup Complete!"
echo "=========================================="
echo ""
echo "Backup location:"
echo "  Folder: $BACKUP_PATH"
echo "  Archive: $BACKUP_DIR/${BACKUP_NAME}.tar.gz"
echo ""
echo "To restore from archive:"
echo "  tar -xzf ${BACKUP_NAME}.tar.gz"
echo "  cd $BACKUP_NAME"
echo "  ./deploy.sh"
echo ""
echo "To restore to specific location:"
echo "  tar -xzf ${BACKUP_NAME}.tar.gz"
echo "  cd $BACKUP_NAME"
echo "  ./restore.sh /path/to/target"
echo ""

