# Local Development Setup

## Required Setup

You need to run **TWO servers** for local development:

### 1. Webpack Dev Server (Port 8081) - Add-on UI
This serves your add-on HTML files and the bundled JavaScript.

```bash
npm start
```

This will start the webpack dev server on `http://localhost:8081`

**Important:** This port (8081) must match your OAuth Client ID configuration in Google Cloud Console:
- Authorized JavaScript origins: `http://localhost:8081`
- Authorized redirect URIs: `http://localhost:8081` and `http://127.0.0.1:8081`

### 2. Meet Proxy Server (Port 8787) - API Proxy
This proxies requests to Google Meet API to avoid CORS issues.

```bash
node meet-proxy.js
```

This will start the proxy server on `http://localhost:8787`

## Complete Local Development Setup

### Step 1: Start the Proxy Server
Open a terminal and run:
```bash
cd "/home/tejs/Downloads/Meet Add on"
node meet-proxy.js
```

You should see:
```
Meet proxy listening on http://localhost:8787
```

### Step 2: Start the Webpack Dev Server
Open **another terminal** and run:
```bash
cd "/home/tejs/Downloads/Meet Add on"
npm start
```

You should see webpack starting and the server running on port 8081.

### Step 3: Access Your Add-on
- Your add-on will be available at: `http://localhost:8081/sidepanel.html`
- You can test locally before deploying

## OAuth Configuration

Make sure your OAuth 2.0 Client ID in Google Cloud Console has:

**Authorized JavaScript origins:**
- `http://localhost:8081`
- `http://127.0.0.1:8081`

**Authorized redirect URIs:**
- `http://localhost:8081`
- `http://127.0.0.1:8081`

## Troubleshooting

### Port Already in Use
If port 8081 is already in use:
1. Find what's using it: `lsof -i :8081` (Linux/Mac) or `netstat -ano | findstr :8081` (Windows)
2. Kill the process or change the port in `webpack.config.cjs`

### Port 8787 Already in Use
If port 8787 is already in use:
1. Find what's using it: `lsof -i :8787` (Linux/Mac)
2. Kill the process or change `PORT` environment variable: `PORT=8788 node meet-proxy.js`

### OAuth redirect_uri_mismatch Error
- Make sure both servers are running
- Verify OAuth Client ID configuration in Google Cloud Console
- Wait 2-5 minutes after changing OAuth settings
- Make sure you're accessing via `http://localhost:8081` (not `https://`)

## Quick Start Script

You can create a script to start both servers:

**start-dev.sh:**
```bash
#!/bin/bash
# Start proxy server in background
node meet-proxy.js &
PROXY_PID=$!

# Start webpack dev server
npm start

# Cleanup on exit
trap "kill $PROXY_PID" EXIT
```

Make it executable: `chmod +x start-dev.sh`
Then run: `./start-dev.sh`

