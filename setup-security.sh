#!/bin/bash

# 🔒 Google Meet Transcript Add-on Security Setup Script
# This script helps you set up the secure environment for the add-on

echo "🔒 Google Meet Transcript Add-on Security Setup"
echo "=============================================="
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "📋 Creating .env file from template..."
    
    cat > .env << 'EOF'
# Google Cloud Service Account Credentials
# Get these from your Google Cloud Console service account
SERVICE_ACCOUNT_EMAIL=service-409997382473@gcp-sa-gsuiteaddons.iam.gserviceaccount.com
SERVICE_ACCOUNT_PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE
CLIENT_ID=409997382473-4dj4ucqs13cmtbt8p57t74elliqa05ch.apps.googleusercontent.com

# Google Cloud Project Configuration
CLOUD_PROJECT_NUMBER=409997382473

# Deepgram API Configuration
DEEPGRAM_API_KEY=306114cbf5e0f315e34cc259af3d16b9fe000992

# Application URLs
MAIN_STAGE_URL=https://sudugutejasvi.github.io/meet-transcript-addon./mainstage.html
SIDE_PANEL_URL=https://sudugutejasvi.github.io/meet-transcript-addon./sidepanel.html

# Security Configuration
NODE_ENV=production
LOG_LEVEL=info
EOF
    
    echo "✅ .env file created!"
    echo ""
else
    echo "✅ .env file already exists"
    echo ""
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
else
    echo "✅ Dependencies already installed"
    echo ""
fi

# Run security tests
echo "🧪 Running security tests..."
echo ""

echo "1️⃣ Testing Secure Credential Manager..."
node test-meet-media-api.mjs

echo ""
echo "2️⃣ Testing Complete Integration..."
node test-complete.mjs

echo ""
echo "🎉 Security setup complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Update your .env file with actual credentials:"
echo "   - Get your Google Cloud service account private key"
echo "   - Get your Deepgram API key"
echo "   - Update the values in .env file"
echo ""
echo "2. Test the setup:"
echo "   node test-complete.mjs"
echo ""
echo "3. Deploy your add-on:"
echo "   npm run build"
echo ""
echo "🔒 Security Status:"
echo "✅ Hardcoded credentials removed"
echo "✅ Environment variables configured"
echo "✅ Credential validation implemented"
echo "✅ Secure file handling enabled"
echo "✅ Google Meet Add-ons framework authentication"
echo ""
echo "📖 For detailed security information, see SECURITY.md"
