# Attendee Webhook Setup Guide

This guide explains how to set up real-time transcript updates using Attendee webhooks.

## Overview

Attendee supports two methods for getting live transcripts:

1. **Webhooks** (Recommended) - Real-time updates with lower latency
2. **API Polling** - Slower but works without webhook setup

## Quick Start with Webhooks

### Step 1: Set Up ngrok (for Local Development)

1. **Install ngrok:**
   ```bash
   # macOS
   brew install ngrok
   
   # Linux/Windows
   # Download from https://ngrok.com/download
   ```

2. **Start your proxy server:**
   ```bash
   node meet-proxy.js
   ```
   Server should be running on `http://localhost:8787`

3. **Expose port 8787 with ngrok:**
   ```bash
   ngrok http 8787
   ```

4. **Copy the HTTPS URL:**
   You'll see something like:
   ```
   Forwarding: https://abc123.ngrok.io -> http://localhost:8787
   ```

5. **Use this URL in the UI:**
   ```
   https://abc123.ngrok.io/api/webhooks/attendee
   ```
   Enter this in the "Attendee Webhook URL" field in the side panel.

### Step 2: Get Webhook Secret (Optional but Recommended)

1. Go to Attendee Dashboard: https://app.attendee.dev
2. Navigate to **Settings → Webhooks**
3. Copy the **Webhook Secret** (base64 encoded)

4. **Set environment variable:**
   ```bash
   export ATTENDEE_WEBHOOK_SECRET="your_secret_here"
   ```
   Or add it to your `.env` file if you're using dotenv.

5. **Restart your proxy server** to load the secret.

### Step 3: Start Transcription

1. Open the Google Meet add-on side panel
2. Enter your webhook URL (from ngrok) in the "Attendee Webhook URL" field
3. Click "🎙️ Start Attendee Transcript"
4. The bot will join the meeting and start sending transcript updates via webhooks

## How It Works

### Webhook Flow

1. **Attendee bot joins meeting** → Creates bot via API
2. **Webhook configured** → Bot sends webhooks to your proxy server
3. **Proxy receives webhooks** → Stores transcripts in memory
4. **Frontend polls proxy** → Fetches new transcripts every 500ms
5. **UI updates** → Transcripts appear in real-time

### API Polling Flow (Fallback)

If no webhook URL is provided:
1. **Attendee bot joins meeting** → Creates bot via API
2. **Frontend polls Attendee API** → Fetches transcripts every 2 seconds
3. **UI updates** → Transcripts appear (slower than webhooks)

## Production Setup

For production, you'll need a publicly accessible HTTPS endpoint:

### Option 1: Deploy Proxy Server

Deploy `meet-proxy.js` to:
- **Render**: https://render.com
- **Railway**: https://railway.app
- **Google Cloud Run**: https://cloud.google.com/run
- **AWS Lambda**: https://aws.amazon.com/lambda/

Then use your production URL:
```
https://your-domain.com/api/webhooks/attendee
```

### Option 2: Use Serverless Function

Create a serverless function that:
1. Receives webhook POST requests
2. Verifies signature
3. Stores transcripts (database or in-memory)
4. Provides GET endpoint for frontend polling

## Webhook Signature Verification

The proxy server automatically verifies webhook signatures if `ATTENDEE_WEBHOOK_SECRET` is set:

```javascript
// Signature is in X-Webhook-Signature header
// Verification uses HMAC-SHA256 with base64-encoded secret
```

If no secret is configured, webhooks are accepted without verification (development only).

## Troubleshooting

### Webhooks Not Working

1. **Check ngrok is running:**
   ```bash
   curl https://your-ngrok-url.ngrok.io/api/webhooks/attendee
   ```

2. **Check proxy server logs:**
   ```
   [Webhook] Received Attendee webhook: ...
   ```

3. **Verify webhook URL in Attendee dashboard:**
   - Go to bot details page
   - Check "Webhooks" tab
   - Verify delivery status

### Webhook URL Format

- ✅ **Correct**: `https://abc123.ngrok.io/api/webhooks/attendee`
- ❌ **Wrong**: `http://abc123.ngrok.io/api/webhooks/attendee` (must be HTTPS)
- ❌ **Wrong**: `https://abc123.ngrok.io` (missing endpoint path)

### Signature Verification Failing

1. **Get secret from Attendee dashboard** (Settings → Webhooks)
2. **Set environment variable:**
   ```bash
   export ATTENDEE_WEBHOOK_SECRET="your_secret_here"
   ```
3. **Restart proxy server**

### Transcripts Not Appearing

1. **Check browser console** for errors
2. **Verify bot is created** (check Attendee dashboard)
3. **Check proxy server logs** for webhook receipts
4. **Try API polling mode** (leave webhook URL empty)

## API Endpoints

### Webhook Endpoint (POST)
```
POST /api/webhooks/attendee
```
Receives webhook events from Attendee.

### Polling Endpoint (GET)
```
GET /api/webhooks/attendee/transcripts/:botId?since=timestamp
```
Fetches transcripts for a specific bot.

### Clear Endpoint (DELETE)
```
DELETE /api/webhooks/attendee/transcripts/:botId
```
Clears stored transcripts for a bot.

## Configuration Options

### Environment Variables

```bash
# Webhook secret for signature verification
ATTENDEE_WEBHOOK_SECRET=your_base64_secret

# Proxy server port (default: 8787)
PORT=8787
```

### Webhook URL Sources (Priority Order)

1. **UI Input** - User enters in side panel
2. **Credentials** - `credentials.attendeeWebhookUrl`
3. **Environment** - `process.env.ATTENDEE_WEBHOOK_URL`
4. **Fallback** - API polling mode

## Testing

### Test Webhook Endpoint

```bash
curl -X POST https://your-ngrok-url.ngrok.io/api/webhooks/attendee \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: test_signature" \
  -d '{
    "trigger": "transcript.update",
    "bot_id": "test-bot-id",
    "data": {
      "speaker_name": "Test Speaker",
      "transcription": {
        "transcript": "Hello, this is a test"
      },
      "timestamp_ms": 1234567890
    }
  }'
```

### Check Transcripts

```bash
curl https://your-ngrok-url.ngrok.io/api/webhooks/attendee/transcripts/test-bot-id
```

## Next Steps

- [ ] Set up ngrok for local development
- [ ] Get webhook secret from Attendee dashboard
- [ ] Configure webhook URL in UI
- [ ] Test webhook delivery
- [ ] Deploy to production (if needed)

## Support

For issues:
1. Check Attendee dashboard for webhook delivery status
2. Review proxy server logs
3. Check browser console for errors
4. Verify webhook URL is accessible (HTTPS)

