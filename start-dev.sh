#!/bin/bash
echo "Starting Meet Add-on Development Servers..."
echo ""
echo "📦 Starting proxy server on port 8787..."
node meet-proxy.js &
PROXY_PID=$!
echo "✅ Proxy server started (PID: $PROXY_PID)"
echo ""
echo "🚀 Starting webpack dev server on port 8081..."
echo "   Access your add-on at: http://localhost:8081/sidepanel.html"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Cleanup function
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $PROXY_PID 2>/dev/null
    exit 0
}

trap cleanup INT TERM

# Start webpack dev server (foreground)
npm start
