# Fixing CORS Issues with ngrok Free Tier

## Problem
When using ngrok free tier, the browser warning page can interfere with CORS preflight (OPTIONS) requests, causing CORS errors even though your server is configured correctly.

## Solutions

### Solution 1: Use ngrok with config file (Recommended)

1. **Start ngrok using the config file:**
   ```bash
   ngrok http 8787 --config ngrok.yml
   ```

2. **Or use command-line flags:**
   ```bash
   ngrok http 8787 --response-header-add "Access-Control-Allow-Origin: *"
   ```

### Solution 2: Visit ngrok URL first

Before making API calls, manually visit your ngrok URL in a browser tab:
```
https://e802e9fc0039.ngrok-free.app/health
```

This will:
- Clear the ngrok warning page
- Allow subsequent OPTIONS requests to pass through

### Solution 3: Upgrade to ngrok paid tier

ngrok paid plans don't show the browser warning page, eliminating this issue entirely.

### Solution 4: Use a different tunnel service

Consider alternatives like:
- **Cloudflare Tunnel** (free, no browser warnings)
- **localtunnel** (free, npm package)
- **serveo.net** (free SSH tunnel)

## Testing CORS

After starting ngrok, test if CORS is working:

```bash
# Test OPTIONS preflight
curl -X OPTIONS https://your-ngrok-url.ngrok-free.app/api/attendee/bots \
  -H "Origin: https://sudugutejasvi.github.io" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: x-attendee-api-key,content-type" \
  -v

# You should see Access-Control-Allow-Origin in the response headers
```

## Debugging

Check your proxy server logs when making requests. You should see:
```
[Proxy] OPTIONS preflight request: { origin: 'https://sudugutejasvi.github.io', ... }
[Proxy] ✅ OPTIONS request allowed for origin: https://sudugutejasvi.github.io
```

If you don't see these logs, the OPTIONS request isn't reaching your server (ngrok is blocking it).

## Quick Fix for Development

For quick testing, you can temporarily bypass CORS in the browser:
1. Open Chrome DevTools
2. Go to Network tab
3. Right-click → "Block request domain" (to disable)
4. Or use a CORS browser extension (not recommended for production)

**Note:** This is only for development. CORS must be properly configured for production.
