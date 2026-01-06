# Quick Start Guide

## Method 1: Use Start Script (Recommended)

```bash
cd /Users/xh/Orion/orion-site-selection-v2
./start.sh
```

## Method 2: Manual Start

**Step 1: Start Backend**

Open terminal and run:
```bash
cd /Users/xh/Orion/orion-site-selection-v2/backend
npm start
```

**Step 2: Start Frontend**

Open **another terminal window** and run:
```bash
cd /Users/xh/Orion/orion-site-selection-v2/frontend
python3 -m http.server 8080
```

**Step 3: Open Browser**

- Visit: `http://localhost:8080`
- Password: `EdgeNebula2026`

## Troubleshooting

### Error: "cd: no such file or directory: backend"
**Solution**: Use the full path:
```bash
cd /Users/xh/Orion/orion-site-selection-v2/backend
```

### Error: "npm error code ENOENT"
**Solution**: Make sure you're in the backend directory:
```bash
pwd  # Should show: /Users/xh/Orion/orion-site-selection-v2/backend
npm start
```

### Error: Port already in use
**Solution**: Change port number
- Backend: Edit `backend/server.js`, change `PORT = 3000` to another port
- Frontend: Use `python3 -m http.server 8081` for a different port

## Current Status

- Backend running on port 3000
- Frontend running on port 8080
- Google Maps configured to display in English
- All UI elements in English



