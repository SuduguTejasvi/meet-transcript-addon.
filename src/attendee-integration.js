/**
 * Attendee.ai Integration
 * Provides real-time transcription using Attendee.ai Meeting Bot API
 * https://docs.attendee.dev/guides/transcription
 */

export class AttendeeIntegration {
  constructor(apiKey, credentials, meetClients = {}) {
    this.apiKey = apiKey;
    this.credentials = credentials;
    this.sidePanelClient = meetClients.sidePanelClient || null;
    this.mainStageClient = meetClients.mainStageClient || null;
    this.botId = null;
    this.meetingUrl = null;
    this.isActive = false;
    this.pollInterval = null;
    this.transcriptEntries = [];
    this.lastTranscriptTimestamp = 0; // Track last transcript timestamp for incremental fetching
    this.useWebhooks = false; // Whether to use webhooks instead of polling
    this.webhookUrl = null; // Webhook URL for bot creation
    this.webhookPollInterval = null; // Polling interval for webhook transcripts
    this.apiFallbackInterval = null; // API fallback polling interval (10 seconds)
    this.lastWebhookTimestamp = 0; // Last timestamp we fetched from webhook endpoint
    this.webhookRetryAttempted = false; // Track if we've tried retrying without webhooks
    
    // Event handlers
    this.onTranscriptUpdate = null;
    this.onBotStatusChange = null;
    this.onError = null;
    
    // API base URL
    this.baseUrl = 'https://app.attendee.dev/api/v1';
    
    // Proxy server URL for webhook polling and API calls
    // In browser, always use proxy to avoid CORS. Default to localhost for local dev, 
    // but should be set to public URL for production (GitHub Pages, etc.)
    this.proxyServerUrl = credentials?.proxyServerUrl || credentials?.proxyUrl || 'http://localhost:8787';
    
    // Use proxy for all API calls when in browser environment (to avoid CORS)
    // Always use proxy in browser to avoid CORS issues
    this.useProxy = typeof window !== 'undefined';
    
    // Log proxy configuration for debugging
    console.log('[Attendee] Proxy config initialized:', {
      useProxy: this.useProxy,
      proxyServerUrl: this.proxyServerUrl,
      isBrowser: typeof window !== 'undefined',
      location: typeof window !== 'undefined' ? window.location.href : 'N/A'
    });
    
    // Polling interval (in milliseconds) - poll every 500ms for lower latency
    this.pollIntervalMs = 500;
    // Webhook polling interval (balance between latency and connection stability)
    this.webhookPollIntervalMs = 500; // 500ms for stability (was 200ms, too aggressive causing connection issues)
    this.webhookPollErrorCount = 0; // Track consecutive errors for backoff
    this.maxWebhookPollErrors = 5; // Max errors before increasing interval
  }

  /**
   * Prompt user for meeting URL as fallback
   */
  async promptForMeetingUrl() {
    return new Promise((resolve) => {
      // Only prompt if we're in a browser environment
      if (typeof window === 'undefined') {
        resolve(null);
        return;
      }
      
      // Try to show a prompt (may not work in all contexts)
      try {
        const meetingCode = prompt('Could not automatically detect the meeting URL.\n\nPlease enter the Google Meet code (e.g., "abc-defg-hij") or full URL:');
        if (meetingCode) {
          let url = meetingCode.trim();
          // If it's just a code, construct the full URL
          if (!url.includes('http')) {
            url = `https://meet.google.com/${url.replace(/^\/+|\/+$/g, '')}`;
          }
          // Validate it's a meet.google.com URL
          if (url.includes('meet.google.com')) {
            console.log('✅ Using manually entered meeting URL:', url);
            resolve(url);
            return;
          }
        }
      } catch (err) {
        console.warn('Could not show prompt:', err);
      }
      
      resolve(null);
    });
  }

  /**
   * Request meeting code from parent window via postMessage
   */
  async requestMeetingCodeFromParent() {
    return new Promise((resolve) => {
      // Set up message listener
      const messageHandler = (event) => {
        if (event.data && event.data.type === 'MEETING_CODE_RESPONSE') {
          window.removeEventListener('message', messageHandler);
          resolve(event.data.meetingCode || null);
        }
      };
      
      window.addEventListener('message', messageHandler);
      
      // Request meeting code from parent
      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: 'REQUEST_MEETING_CODE' }, '*');
          // Timeout after 1 second
          setTimeout(() => {
            window.removeEventListener('message', messageHandler);
            resolve(null);
          }, 1000);
        } else {
          resolve(null);
        }
      } catch (err) {
        console.warn('Error requesting meeting code from parent:', err);
        window.removeEventListener('message', messageHandler);
        resolve(null);
      }
    });
  }

  /**
   * Get the current meeting URL from Google Meet session
   */
  async getMeetingUrl() {
    try {
      console.log('Attempting to detect meeting URL...');
      
      // Method 1: Extract from current page URL parameters (for iframe context)
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const origin = urlParams.get('origin');
        if (origin) {
          const decodedOrigin = decodeURIComponent(origin);
          console.log('Found origin parameter:', decodedOrigin);
          
          // If origin is meet.google.com, try to get meeting code from parent or other sources
          if (decodedOrigin.includes('meet.google.com')) {
            // Try to extract meeting code from parent window via postMessage
            const meetingCode = await this.requestMeetingCodeFromParent();
            if (meetingCode) {
              const url = `https://meet.google.com/${meetingCode}`;
              console.log('✅ Found meeting URL from parent communication:', url);
              return url;
            }
          }
        }
        
        // Try to decode meet_sdk parameter (base64 encoded JSON)
        const meetSdk = urlParams.get('meet_sdk');
        if (meetSdk) {
          try {
            const decoded = atob(meetSdk);
            const sdkData = JSON.parse(decoded);
            console.log('Decoded meet_sdk:', sdkData);
            // SDK data might contain meeting information
            if (sdkData && Array.isArray(sdkData) && sdkData.length > 1) {
              // Often contains [version, channel, origin, projectNumber, ...]
              const possibleUrl = sdkData.find(item => typeof item === 'string' && item.includes('meet.google.com'));
              if (possibleUrl) {
                // If it's just the base URL, try to extract meeting code from parent window
                if (possibleUrl === 'https://meet.google.com' || possibleUrl.endsWith('meet.google.com/')) {
                  console.log('⚠️ Found base URL from meet_sdk, trying to extract meeting code from parent...');
                  // Try to get meeting code from parent window URL
                  try {
                    if (window.parent && window.parent !== window) {
                      const parentUrl = window.parent.location.href;
                      const meetingCodeMatch = parentUrl.match(/meet\.google\.com\/([a-z0-9-]+)/i);
                      if (meetingCodeMatch && meetingCodeMatch[1]) {
                        const fullUrl = `https://meet.google.com/${meetingCodeMatch[1]}`;
                        console.log('✅ Extracted meeting URL from parent window:', fullUrl);
                        return fullUrl;
                      }
                    }
                  } catch (e) {
                    console.warn('Could not access parent window (cross-origin):', e.message);
                  }
                  // If parent access fails, don't return the base URL - continue to other methods
                  console.log('⚠️ Could not extract meeting code, continuing to other detection methods');
                } else {
                  console.log('✅ Found meeting URL from meet_sdk:', possibleUrl);
                  return possibleUrl;
                }
              }
            }
          } catch (e) {
            console.warn('Could not decode meet_sdk parameter:', e);
          }
        }
      } catch (err) {
        console.warn('Error extracting from URL parameters:', err);
      }
      
      // Method 2: Try using sidePanelClient or mainStageClient to get meeting info
      if (this.sidePanelClient) {
        try {
          const meetingInfo = await this.sidePanelClient.getMeetingInfo?.();
          console.log('📋 Meeting info from sidePanelClient:', JSON.stringify(meetingInfo, null, 2));
          
          // Check all possible fields that might contain the meeting URL or code
          if (meetingInfo?.meetingUrl) {
            console.log('✅ Found meeting URL from sidePanelClient:', meetingInfo.meetingUrl);
            return meetingInfo.meetingUrl;
          }
          if (meetingInfo?.meetingCode) {
            const url = `https://meet.google.com/${meetingInfo.meetingCode}`;
            console.log('✅ Constructed meeting URL from meetingCode:', url);
            return url;
          }
          if (meetingInfo?.meetingId) {
            // Try to construct URL from meeting ID
            const url = `https://meet.google.com/${meetingInfo.meetingId}`;
            console.log('✅ Constructed meeting URL from meetingId:', url);
            return url;
          }
          // Check for any field that looks like a meeting code/URL
          for (const [key, value] of Object.entries(meetingInfo || {})) {
            if (typeof value === 'string') {
              if (value.includes('meet.google.com')) {
                console.log(`✅ Found meeting URL in field ${key}:`, value);
                return value;
              }
              // Check if it looks like a meeting code (abc-defg-hij format)
              if (/^[a-z]{3}-[a-z]{4}-[a-z]{3}$/i.test(value)) {
                const url = `https://meet.google.com/${value}`;
                console.log(`✅ Found meeting code in field ${key}:`, url);
                return url;
              }
            }
          }
        } catch (err) {
          console.warn('Could not get meeting URL from sidePanelClient:', err);
        }
      }
      
      if (this.mainStageClient) {
        try {
          const meetingInfo = await this.mainStageClient.getMeetingInfo?.();
          console.log('📋 Meeting info from mainStageClient:', JSON.stringify(meetingInfo, null, 2));
          if (meetingInfo?.meetingUrl) {
            console.log('✅ Found meeting URL from mainStageClient:', meetingInfo.meetingUrl);
            return meetingInfo.meetingUrl;
          }
          if (meetingInfo?.meetingCode) {
            const url = `https://meet.google.com/${meetingInfo.meetingCode}`;
            console.log('✅ Constructed meeting URL from meetingCode:', url);
            return url;
          }
          if (meetingInfo?.meetingId) {
            const url = `https://meet.google.com/${meetingInfo.meetingId}`;
            console.log('✅ Constructed meeting URL from meetingId:', url);
            return url;
          }
          // Check for any field that looks like a meeting code/URL
          for (const [key, value] of Object.entries(meetingInfo || {})) {
            if (typeof value === 'string') {
              if (value.includes('meet.google.com')) {
                console.log(`✅ Found meeting URL in field ${key}:`, value);
                return value;
              }
              if (/^[a-z]{3}-[a-z]{4}-[a-z]{3}$/i.test(value)) {
                const url = `https://meet.google.com/${value}`;
                console.log(`✅ Found meeting code in field ${key}:`, url);
                return url;
              }
            }
          }
        } catch (err) {
          console.warn('Could not get meeting URL from mainStageClient:', err);
        }
      }
      
      // Method 3: From Meet Add-ons SDK session
      if (this.credentials?.meetSession) {
        try {
          const meetingInfo = await this.credentials.meetSession.getMeetingInfo?.();
          console.log('📋 Meeting info from meetSession:', JSON.stringify(meetingInfo, null, 2));
          if (meetingInfo?.meetingUrl) {
            console.log('✅ Found meeting URL from meetSession:', meetingInfo.meetingUrl);
            return meetingInfo.meetingUrl;
          }
          if (meetingInfo?.meetingCode) {
            const url = `https://meet.google.com/${meetingInfo.meetingCode}`;
            console.log('✅ Constructed meeting URL from meetingCode:', url);
            return url;
          }
          if (meetingInfo?.meetingId) {
            const url = `https://meet.google.com/${meetingInfo.meetingId}`;
            console.log('✅ Constructed meeting URL from meetingId:', url);
            return url;
          }
          // Check for any field that looks like a meeting code/URL
          for (const [key, value] of Object.entries(meetingInfo || {})) {
            if (typeof value === 'string') {
              if (value.includes('meet.google.com')) {
                console.log(`✅ Found meeting URL in field ${key}:`, value);
                return value;
              }
              if (/^[a-z]{3}-[a-z]{4}-[a-z]{3}$/i.test(value)) {
                const url = `https://meet.google.com/${value}`;
                console.log(`✅ Found meeting code in field ${key}:`, url);
                return url;
              }
            }
          }
        } catch (err) {
          console.warn('Could not get meeting URL from Meet session:', err);
        }
      }
      
      // Method 4: Try to access parent window URL (if in iframe)
      try {
        if (window.parent && window.parent !== window) {
          const parentUrl = window.parent.location.href;
          console.log('Parent window URL:', parentUrl);
          if (parentUrl.includes('meet.google.com')) {
            const match = parentUrl.match(/meet\.google\.com\/([a-z0-9-]+)/i);
            if (match && match[1] && match[1].length > 3) {
              const meetingCode = match[1];
              const url = `https://meet.google.com/${meetingCode}`;
              console.log('✅ Found meeting URL from parent window:', url);
              return url;
            }
          }
        }
      } catch (err) {
        // Cross-origin restrictions might prevent this
        console.warn('Could not access parent window (cross-origin):', err.message);
      }
      
      // Method 5: Try document.referrer
      try {
        const referrer = document.referrer;
        if (referrer && referrer.includes('meet.google.com')) {
          const match = referrer.match(/meet\.google\.com\/([a-z0-9-]+)/i);
          if (match && match[1] && match[1].length > 3) {
            const meetingCode = match[1];
            const url = `https://meet.google.com/${meetingCode}`;
            console.log('✅ Found meeting URL from referrer:', url);
            return url;
          }
        }
      } catch (err) {
        console.warn('Could not get meeting URL from referrer:', err);
      }
      
      // Method 6: From current browser URL
      const currentUrl = window.location.href;
      if (currentUrl.includes('meet.google.com')) {
        const match = currentUrl.match(/meet\.google\.com\/([a-z0-9-]+)/i);
        if (match && match[1] && match[1].length > 3) {
          const meetingCode = match[1];
          const url = `https://meet.google.com/${meetingCode}`;
          console.log('✅ Found meeting URL from current URL:', url);
          return url;
        }
      }
      
      // Method 7: Try to find in DOM
      const meetLinks = document.querySelectorAll('a[href*="meet.google.com"]');
      if (meetLinks.length > 0) {
        for (const link of meetLinks) {
          const href = link.href;
          const match = href.match(/meet\.google\.com\/([a-z0-9-]+)/i);
          if (match && match[1] && match[1].length > 3) {
            const url = `https://meet.google.com/${match[1]}`;
            console.log('✅ Found meeting URL from DOM link:', url);
            return url;
          }
        }
      }
      
      // Method 8: Try to get from sessionStorage/localStorage (Google Meet might store it)
      try {
        const storedUrl = sessionStorage.getItem('meet_url') || localStorage.getItem('meet_url');
        if (storedUrl && storedUrl.includes('meet.google.com')) {
          console.log('✅ Found meeting URL from storage:', storedUrl);
          return storedUrl;
        }
        
        // Try to get meeting code from storage
        const storedCode = sessionStorage.getItem('meet_code') || localStorage.getItem('meet_code');
        if (storedCode) {
          const url = `https://meet.google.com/${storedCode}`;
          console.log('✅ Found meeting URL from stored code:', url);
          return url;
        }
      } catch (err) {
        console.warn('Could not access storage:', err);
      }
      
      // Method 9: Try window.name (sometimes used by iframes)
      try {
        if (window.name && window.name.includes('meet.google.com')) {
          const match = window.name.match(/meet\.google\.com\/([a-z0-9-]+)/i);
          if (match && match[1]) {
            const url = `https://meet.google.com/${match[1]}`;
            console.log('✅ Found meeting URL from window.name:', url);
            return url;
          }
        }
      } catch (err) {
        console.warn('Could not access window.name:', err);
      }
      
      // Final fallback: Return null
      console.warn('⚠️ Could not automatically detect meeting URL from any source');
      return null;
    } catch (error) {
      console.error('Error getting meeting URL:', error);
      return null;
    }
  }

  /**
   * Set webhook URL for real-time updates
   */
  setWebhookUrl(webhookUrl) {
    this.webhookUrl = webhookUrl;
    this.useWebhooks = !!webhookUrl;
    console.log('Webhook URL set:', webhookUrl);
  }

  /**
   * Create a bot to join the meeting
   * POST /bots with meeting_url
   */
  async createBot(meetingUrl = null) {
    try {
      if (!this.apiKey) {
        throw new Error('Attendee.ai API key is required');
      }
      
      // Console log the API key being used for bot creation
      console.log('🔑 Creating bot with Attendee API Key:', this.apiKey);
      console.log('🔑 API Key length:', this.apiKey.length);

      // Get meeting URL if not provided
      if (!meetingUrl) {
        meetingUrl = await this.getMeetingUrl();
        if (!meetingUrl) {
          // Last resort: try to prompt user for meeting URL
          const userMeetingUrl = await this.promptForMeetingUrl();
          if (userMeetingUrl) {
            meetingUrl = userMeetingUrl;
          } else {
            throw new Error('Could not detect meeting URL. Please ensure you are running this from within a Google Meet session. You may need to manually enter the meeting URL if automatic detection fails.');
          }
        }
      }

      this.meetingUrl = meetingUrl;
      console.log('Creating Attendee.ai bot for meeting:', meetingUrl);

      // Build request body
      // Extract meeting code for bot name (e.g., "dbg-jzza-zte" from "https://meet.google.com/dbg-jzza-zte")
      const meetingCodeMatch = meetingUrl.match(/meet\.google\.com\/([a-z0-9-]+)/i);
      const meetingCode = meetingCodeMatch ? meetingCodeMatch[1] : 'meet-bot';
      const botName = `Transcript Bot - ${meetingCode}`;

      const requestBody = {
        meeting_url: meetingUrl,
        bot_name: botName, // Required field
        // Optional: Configure transcription settings
        transcription_settings: {
          deepgram: {
            language: 'en-US',
            model: 'nova-2'
            // Note: 'punctuate' and 'smart_format' are not allowed by Attendee.ai API
          }
        }
      };

      // Add webhooks if configured (check both webhookUrl and try to construct from proxy)
      let effectiveWebhookUrl = this.webhookUrl;
      if (!effectiveWebhookUrl && this.useProxy && this.proxyServerUrl) {
        try {
          const proxyUrl = new URL(this.proxyServerUrl);
          // For localhost, we can't use webhooks (they need HTTPS), but log it
          if (proxyUrl.protocol === 'https:') {
            effectiveWebhookUrl = `${this.proxyServerUrl}/api/webhooks/attendee`;
            console.log('[Attendee] Will use proxy webhook URL:', effectiveWebhookUrl);
          } else {
            console.log('[Attendee] Proxy is HTTP (localhost), webhooks require HTTPS. Using API polling instead.');
          }
        } catch (e) {
          // Invalid URL, skip
        }
      }

      if (effectiveWebhookUrl) {
        // Validate webhook URL format before adding
        try {
          const webhookUrlObj = new URL(effectiveWebhookUrl);
          if (webhookUrlObj.protocol !== 'https:') {
            console.warn('[Attendee] ⚠️ Webhook URL must be HTTPS, skipping webhooks');
            effectiveWebhookUrl = null;
          } else {
            requestBody.webhooks = [
              {
                url: effectiveWebhookUrl,
                triggers: ['transcript.update', 'bot.state_change']
              }
            ];
            console.log('[Attendee] Using webhooks for real-time updates:', effectiveWebhookUrl);
            this.setWebhookUrl(effectiveWebhookUrl);
          }
        } catch (e) {
          console.warn('[Attendee] ⚠️ Invalid webhook URL format, skipping webhooks:', e.message);
          effectiveWebhookUrl = null;
        }
      }

      // Use proxy server to avoid CORS issues in browser
      const url = this.useProxy 
        ? `${this.proxyServerUrl}/api/attendee/bots`
        : `${this.baseUrl}/bots`;
      
      // Debug logging
      console.log('[Attendee] Proxy configuration:', {
        useProxy: this.useProxy,
        proxyServerUrl: this.proxyServerUrl,
        baseUrl: this.baseUrl,
        finalUrl: url,
        isBrowser: typeof window !== 'undefined'
      });
      
      // WORKAROUND: ngrok free tier intercepts OPTIONS preflight requests
      // Make a simple GET request first (no custom headers = no preflight) to clear ngrok warning
      if (this.useProxy && this.proxyServerUrl && (this.proxyServerUrl.includes('ngrok-free.app') || this.proxyServerUrl.includes('ngrok-free.dev'))) {
        try {
          console.log('[Attendee] 🔥 Warming up ngrok connection to bypass warning page...');
          // Simple GET without custom headers - won't trigger CORS preflight
          await fetch(`${this.proxyServerUrl}/health`, {
            method: 'GET',
            mode: 'cors',
            credentials: 'omit' // Don't send credentials to avoid preflight
          }).catch(err => {
            // Ignore warm-up errors, just log them
            console.log('[Attendee] Warm-up request completed (errors are OK):', err.message);
          });
          // Small delay to ensure ngrok processes the warm-up
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (err) {
          // Continue even if warm-up fails
          console.log('[Attendee] Warm-up request failed (continuing anyway):', err.message);
        }
      }
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Add API key to headers (proxy expects it in x-attendee-api-key or Authorization)
      if (this.useProxy) {
        headers['x-attendee-api-key'] = this.apiKey;
        // Add ngrok bypass header if using ngrok-free.app or ngrok-free.dev
        if (this.proxyServerUrl && (this.proxyServerUrl.includes('ngrok-free.app') || this.proxyServerUrl.includes('ngrok-free.dev'))) {
          headers['ngrok-skip-browser-warning'] = 'true';
        }
        console.log('[Attendee] Using proxy server:', url);
      } else {
        headers['Authorization'] = `Token ${this.apiKey}`;
        console.log('[Attendee] Using direct API (not in browser):', url);
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || errorData.message || errorData.error || '';
        const errorInfo = errorData.errors ? JSON.stringify(errorData.errors) : '';
        
        console.error('[Attendee] ❌ Bot creation failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          requestBody: requestBody
        });
        
        // If webhooks are causing the issue, try without them
        if (response.status === 400 && requestBody.webhooks && !this.webhookRetryAttempted) {
          console.warn('[Attendee] ⚠️ 400 error with webhooks, retrying without webhooks...');
          console.warn('[Attendee] This might be due to ngrok free tier restrictions or webhook URL validation');
          this.webhookRetryAttempted = true;
          // Temporarily disable webhooks and retry
          const originalWebhookUrl = this.webhookUrl;
          this.webhookUrl = null;
          this.useWebhooks = false;
          // Retry without webhooks
          return this.createBot(meetingUrl).finally(() => {
            // Restore webhook URL for future use (but won't be used in this session)
            this.webhookUrl = originalWebhookUrl;
          });
        }
        
        throw new Error(`Failed to create bot: ${response.status} ${response.statusText}. ${errorMessage} ${errorInfo}`);
      }

      const botData = await response.json();
      this.botId = botData.id || botData.bot_id;
      
      console.log('✅ Bot created successfully:', this.botId);
      
      if (this.onBotStatusChange) {
        this.onBotStatusChange({ status: 'created', botId: this.botId });
      }

      return botData;
    } catch (error) {
      console.error('Error creating bot:', error);
      if (this.onError) {
        this.onError(error);
      }
      throw error;
    }
  }

  /**
   * Get transcript from the bot
   * GET /bots/{bot_id}/transcript
   */
  async getTranscript(sinceTimestamp = null) {
    try {
      if (!this.botId) {
        throw new Error('Bot ID is required. Create a bot first.');
      }

      // Use proxy server to avoid CORS issues in browser
      let url = this.useProxy
        ? `${this.proxyServerUrl}/api/attendee/bots/${this.botId}/transcript`
        : `${this.baseUrl}/bots/${this.botId}/transcript`;
      
      // Add query parameters if provided (for incremental fetching)
      if (sinceTimestamp) {
        const separator = url.includes('?') ? '&' : '?';
        url += `${separator}since=${sinceTimestamp}`;
      }
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Add API key to headers (proxy expects it in x-attendee-api-key or Authorization)
      if (this.useProxy) {
        headers['x-attendee-api-key'] = this.apiKey;
        // Add ngrok bypass header if using ngrok-free.app or ngrok-free.dev
        if (this.proxyServerUrl && (this.proxyServerUrl.includes('ngrok-free.app') || this.proxyServerUrl.includes('ngrok-free.dev'))) {
          headers['ngrok-skip-browser-warning'] = 'true';
        }
      } else {
        headers['Authorization'] = `Token ${this.apiKey}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });

      if (!response.ok) {
        // 404 is normal when bot first starts (no transcripts yet)
        if (response.status === 404) {
          console.log('[Attendee] No transcripts yet (bot may have just started)');
          return [];
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to get transcript: ${response.status} ${response.statusText}. ${errorData.message || errorData.detail || ''}`);
      }

      // Check if response is HTML (ngrok warning page) - clone response to peek without consuming
      let transcriptData;
      try {
        // Clone response to check content without consuming the original
        const clonedResponse = response.clone();
        const text = await clonedResponse.text();
        
        // Check if it's HTML (ngrok warning page)
        if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html') || text.includes('ngrok') || text.includes('You are about to visit')) {
          console.error('[Attendee] Received HTML instead of JSON when getting transcript:', text.substring(0, 300));
          console.warn('[Attendee] Returning empty array - ngrok warning page detected');
          return []; // Return empty array instead of throwing error to allow retry
        }
        
        // Parse as JSON
        transcriptData = await response.json();
      } catch (error) {
        // If JSON parse failed, it might be HTML
        if (error.message && error.message.includes('JSON')) {
          console.error('[Attendee] Error parsing transcript response as JSON:', error.message);
          console.warn('[Attendee] Returning empty array - likely ngrok warning page');
          return []; // Return empty array to allow retry
        }
        // Re-throw other errors
        throw error;
      }
      
      // Log detailed response structure for debugging (when data is found or first few calls)
      const shouldLog = (this.pollCount && this.pollCount <= 5) || (Array.isArray(transcriptData) && transcriptData.length > 0);
      if (shouldLog) {
        console.log('[Attendee] Transcript API response details:', {
          isArray: Array.isArray(transcriptData),
          length: Array.isArray(transcriptData) ? transcriptData.length : 'N/A',
          type: typeof transcriptData,
          keys: transcriptData && typeof transcriptData === 'object' && !Array.isArray(transcriptData) ? Object.keys(transcriptData) : [],
          sample: transcriptData && Array.isArray(transcriptData) && transcriptData.length > 0 ? transcriptData[0] : null
        });
      }
      
      return transcriptData;
    } catch (error) {
      console.error('Error getting transcript:', error);
      if (this.onError) {
        this.onError(error);
      }
      throw error;
    }
  }

  /**
   * Start live transcription polling or webhook polling
   */
  async startTranscription(meetingUrl = null) {
    try {
      if (this.isActive) {
        console.warn('Transcription is already active');
        return;
      }

      // Create bot if not already created
      if (!this.botId) {
        await this.createBot(meetingUrl);
      }

      this.isActive = true;
      this.transcriptEntries = [];
      this.lastWebhookTimestamp = 0;
      this.lastTranscriptTimestamp = 0; // Reset timestamp tracking
      this.pollCount = 0; // Reset poll count

      // Wait for bot to join and transcription to start
      console.log('[Attendee] Waiting for bot to join meeting and transcription to start...');
      let transcriptionStarted = false;
      const maxWaitTime = 60000; // Wait up to 60 seconds
      const checkInterval = 2000; // Check every 2 seconds
      const startTime = Date.now();
      
      while (!transcriptionStarted && (Date.now() - startTime) < maxWaitTime) {
        try {
          const botInfo = await this.getBotInfo();
          const state = botInfo.state || botInfo.status;
          const transcriptionState = botInfo.transcription_state;
          
          console.log(`[Attendee] Bot status: state=${state}, transcription_state=${transcriptionState}`);
          
          // Check if transcription has started
          if (transcriptionState === 'active' || transcriptionState === 'started' || transcriptionState === 'transcribing') {
            transcriptionStarted = true;
            console.log('[Attendee] ✅ Transcription has started!');
            break;
          }
          
          // If bot has joined but transcription not started, wait a bit more
          if (state === 'joined_recording' || state === 'active') {
            if (transcriptionState === 'not_started') {
              console.log('[Attendee] ⚠️ Bot joined but transcription not started yet. This may be because:');
              console.log('[Attendee]   1. No participants are speaking (all muted)');
              console.log('[Attendee]   2. Transcription needs audio input to activate');
              console.log('[Attendee]   3. Waiting for meeting audio stream...');
              // Continue waiting, but don't block forever
            }
          }
          
          // Wait before next check
          await new Promise(resolve => setTimeout(resolve, checkInterval));
        } catch (error) {
          console.warn('[Attendee] Error checking bot status:', error.message);
          // Continue waiting despite errors
          await new Promise(resolve => setTimeout(resolve, checkInterval));
        }
      }
      
      if (!transcriptionStarted) {
        console.warn('[Attendee] ⚠️ Transcription did not start automatically. This is normal if:');
        console.warn('[Attendee]   - All participants are muted');
        console.warn('[Attendee]   - No one is speaking');
        console.warn('[Attendee] Transcription will start automatically when audio is detected.');
      }

      // If webhook URL is configured, use webhook polling
      // Otherwise, construct webhook URL from proxy server if available
      let effectiveWebhookUrl = this.webhookUrl;
      
      if (!effectiveWebhookUrl && this.useProxy && this.proxyServerUrl) {
        // Try to construct webhook URL from proxy server
        // For local development, we'd need ngrok or similar
        // For production, proxy should be publicly accessible
        try {
          const proxyUrl = new URL(this.proxyServerUrl);
          // Only use proxy webhook if it's HTTPS (production)
          if (proxyUrl.protocol === 'https:') {
            effectiveWebhookUrl = `${this.proxyServerUrl}/api/webhooks/attendee`;
            console.log('[Attendee] Using proxy server webhook URL:', effectiveWebhookUrl);
            this.setWebhookUrl(effectiveWebhookUrl);
          }
        } catch (e) {
          // Invalid URL, skip
        }
      }

      // Use webhooks if available (faster and more real-time)
      // Also add API polling as fallback every 2 seconds to catch any missed transcripts
      if (this.useWebhooks && effectiveWebhookUrl) {
        console.log('Starting webhook-based transcription polling (primary method)...');
        this.startWebhookPolling();
        
        // Add API polling as fallback every 2 seconds to reduce latency
        // This ensures we catch transcripts even if webhooks are delayed
        console.log('Starting API fallback polling (every 2 seconds)...');
        this.startApiFallbackPolling();
      } else {
        console.log('Starting API-based transcription polling (no webhooks configured)...');
        this.startPolling();
      }

      if (this.onBotStatusChange) {
        this.onBotStatusChange({ status: 'active', botId: this.botId });
      }

      // Log initial state
      console.log('[Attendee] Transcription active. Waiting for transcripts...');
      
      // Continue checking bot status periodically
      if (this.botId) {
        this.checkBotStatusPeriodically();
      }
      
      if (this.onTranscriptUpdate) {
        // Show a placeholder message if UI supports it
        const placeholderEntry = {
          speakerName: 'System',
          transcription: '🎙️ Bot is active. Waiting for participants to speak...',
          timestamp: Date.now(),
          duration: 0,
          isFinal: true,
          isPlaceholder: true
        };
        // Only show placeholder if no transcripts yet
        setTimeout(() => {
          if (this.transcriptEntries.length === 0) {
            this.onTranscriptUpdate(placeholderEntry);
          }
        }, 1000);
      }

      return true;
    } catch (error) {
      console.error('Error starting transcription:', error);
      this.isActive = false;
      if (this.onError) {
        this.onError(error);
      }
      throw error;
    }
  }

  /**
   * Start polling webhook endpoint for transcript updates
   */
  startWebhookPolling() {
    if (this.webhookPollInterval) {
      clearInterval(this.webhookPollInterval);
    }

    // Reset error count when starting
    this.webhookPollErrorCount = 0;
    
    console.log('[Attendee] Starting webhook polling (interval: ' + this.webhookPollIntervalMs + 'ms)');
    
    // Poll immediately
    this.pollWebhookTranscripts();

    // Then poll at regular intervals
    this.webhookPollInterval = setInterval(() => {
      this.pollWebhookTranscripts();
    }, this.webhookPollIntervalMs);
  }

  /**
   * Poll webhook transcripts from proxy server
   */
  async pollWebhookTranscripts() {
    try {
      if (!this.isActive || !this.botId) {
        return;
      }

      const url = `${this.proxyServerUrl}/api/webhooks/attendee/transcripts/${this.botId}?since=${this.lastWebhookTimestamp}`;
      
      const headers = {
        'Content-Type': 'application/json'
      };
      // Add ngrok bypass header if using ngrok-free.app or ngrok-free.dev
      if (this.proxyServerUrl && (this.proxyServerUrl.includes('ngrok-free.app') || this.proxyServerUrl.includes('ngrok-free.dev'))) {
        headers['ngrok-skip-browser-warning'] = 'true';
      }
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        // Handle different error statuses
        if (response.status === 429) {
          // Rate limited - increase polling interval temporarily
          console.warn('[Attendee] Rate limited, slowing down polling');
          this.webhookPollErrorCount++;
          if (this.webhookPollErrorCount >= this.maxWebhookPollErrors) {
            // Temporarily increase interval
            const currentInterval = this.webhookPollIntervalMs;
            this.webhookPollIntervalMs = Math.min(currentInterval * 2, 5000); // Max 5 seconds
            console.log(`[Attendee] Increased webhook polling interval to ${this.webhookPollIntervalMs}ms`);
            // Restart polling with new interval
            if (this.webhookPollInterval) {
              clearInterval(this.webhookPollInterval);
              this.startWebhookPolling();
            }
          }
        }
        console.warn('[Attendee] Error polling webhook transcripts:', response.status);
        this.webhookPollErrorCount++;
        return;
      }
      
      // Reset error count on success
      this.webhookPollErrorCount = 0;

      const data = await response.json();
      const newTranscripts = data.transcripts || [];

      // Add logging to see what we're getting
      if (newTranscripts.length > 0) {
        console.log(`[Attendee] Webhook poll: Found ${newTranscripts.length} new transcript(s) from webhook endpoint`);
      }

      if (newTranscripts.length > 0) {
        // Process bot state changes separately
        const stateChanges = newTranscripts.filter(e => e.type === 'bot_state_change');
        const transcriptEntries = newTranscripts.filter(e => e.transcription && e.type !== 'bot_state_change');
        
        // Handle bot state changes
        stateChanges.forEach(entry => {
          if (this.onBotStatusChange) {
            this.onBotStatusChange({
              status: entry.newState,
              oldStatus: entry.oldState,
              eventType: entry.eventType,
              botId: entry.botId
            });
          }
        });
        
        // Convert webhook transcript format to API format for unified processing
        const apiFormatEntries = transcriptEntries.map(entry => ({
          speaker_name: entry.speakerName,
          speaker_uuid: entry.speakerUuid,
          timestamp_ms: entry.timestamp,
          duration_ms: entry.duration,
          transcription: typeof entry.transcription === 'string' 
            ? entry.transcription 
            : (entry.transcription?.transcript || entry.transcription?.text || ''),
          is_final: true
        }));
        
        // Use the same deduplication logic as API polling
        if (apiFormatEntries.length > 0) {
          console.log(`[Attendee] Processing ${apiFormatEntries.length} webhook transcript entry(s)`);
          this.processTranscriptEntries(apiFormatEntries);
        }

        // Update last timestamp
        if (data.latestTimestamp > this.lastWebhookTimestamp) {
          this.lastWebhookTimestamp = data.latestTimestamp;
        }
      }
    } catch (error) {
      // Handle specific error types
      if (error.name === 'AbortError') {
        console.warn('[Attendee] Webhook polling request timed out');
      } else if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_CLOSED'))) {
        console.warn('[Attendee] Connection error during webhook polling (connection closed or network issue)');
        this.webhookPollErrorCount++;
        
        // If too many errors, increase polling interval
        if (this.webhookPollErrorCount >= this.maxWebhookPollErrors) {
          const currentInterval = this.webhookPollIntervalMs;
          this.webhookPollIntervalMs = Math.min(currentInterval * 1.5, 3000); // Max 3 seconds
          console.log(`[Attendee] Increased webhook polling interval to ${this.webhookPollIntervalMs}ms due to connection errors`);
          // Restart polling with new interval
          if (this.webhookPollInterval) {
            clearInterval(this.webhookPollInterval);
            // Wait a bit before restarting
            setTimeout(() => {
              if (this.isActive) {
                this.startWebhookPolling();
              }
            }, 1000);
          }
        }
      } else {
        console.error('[Attendee] Error polling webhook transcripts:', error);
        this.webhookPollErrorCount++;
      }
      
      // Don't stop polling on error, just log it and adjust interval
    }
  }

  /**
   * Start API polling as fallback (runs every 10 seconds when webhooks are active)
   */
  startApiFallbackPolling() {
    if (this.apiFallbackInterval) {
      clearInterval(this.apiFallbackInterval);
    }

    // Poll immediately
    this.pollTranscript();

    // Then poll at 2-second intervals as fallback (reduced from 10s for lower latency)
    this.apiFallbackInterval = setInterval(() => {
      this.pollTranscript();
    }, 2000); // 2 seconds = 2000ms (reduced from 10s for lower latency)
  }

  /**
   * Start polling for transcript updates
   */
  startPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }

    // Poll immediately
    this.pollTranscript();

    // Then poll at regular intervals
    this.pollInterval = setInterval(() => {
      this.pollTranscript();
    }, this.pollIntervalMs);
  }

  /**
   * Poll for transcript updates
   */
  async pollTranscript() {
    try {
      if (!this.isActive || !this.botId) {
        return;
      }

      // Track last timestamp to only get new transcripts (incremental fetching)
      // Note: Attendee.ai API may not support 'since' parameter, so we'll fetch all and deduplicate
      const transcriptData = await this.getTranscript(null);
      
      // Log raw response for first few polls to debug API format
      if (this.pollCount === undefined) this.pollCount = 0;
      this.pollCount++;
      if (this.pollCount <= 5) {
        console.log(`[Attendee] Poll #${this.pollCount}: Raw API response:`, JSON.stringify(transcriptData, null, 2));
      }
      
      // Handle different response formats from Attendee.ai API
      let entries = [];
      if (Array.isArray(transcriptData)) {
        entries = transcriptData;
      } else if (transcriptData.entries) {
        entries = transcriptData.entries;
      } else if (transcriptData.transcript) {
        entries = Array.isArray(transcriptData.transcript) ? transcriptData.transcript : [transcriptData.transcript];
      } else if (transcriptData.data && Array.isArray(transcriptData.data)) {
        entries = transcriptData.data;
      } else if (transcriptData.results && Array.isArray(transcriptData.results)) {
        entries = transcriptData.results;
      } else if (transcriptData && typeof transcriptData === 'object') {
        // Log response structure if no entries found
        if (this.pollCount <= 5) {
          console.log(`[Attendee] Poll #${this.pollCount}: No entries found. Response keys:`, Object.keys(transcriptData));
          console.log(`[Attendee] Poll #${this.pollCount}: Full response:`, JSON.stringify(transcriptData, null, 2));
        }
      }

      // Log for debugging
      if (this.pollCount <= 5 || entries.length > 0) {
        console.log(`[Attendee] Poll #${this.pollCount}: Found ${entries.length} transcript entries`);
        if (entries.length > 0) {
          console.log('[Attendee] Sample entry:', JSON.stringify(entries[0], null, 2));
        } else if (this.pollCount <= 10) {
          // For first 10 polls, also check bot info to see if there are events
          try {
            const botInfo = await this.getBotInfo();
            // getBotInfo now processes events automatically, so we just log
            if (botInfo.events && botInfo.events.length > 0) {
              console.log(`[Attendee] Bot has ${botInfo.events.length} events - checking for transcripts in events...`);
            }
          } catch (e) {
            // Ignore errors checking bot info during polling
          }
        }
      }

      // Update last timestamp if we got new entries
      if (entries.length > 0) {
        // Find the highest timestamp in the entries
        const timestamps = entries.map(e => e.timestamp_ms || e.timestamp || 0).filter(ts => ts > 0);
        if (timestamps.length > 0) {
          const maxTimestamp = Math.max(...timestamps);
          if (maxTimestamp > this.lastTranscriptTimestamp) {
            this.lastTranscriptTimestamp = maxTimestamp;
            console.log(`[Attendee] Updated last transcript timestamp: ${maxTimestamp}`);
          }
        }
      }

      // Process new entries
      if (entries.length > 0) {
        this.processTranscriptEntries(entries);
      } else if (this.pollCount > 10 && this.pollCount % 10 === 0) {
        // Log periodically if no transcripts after many polls
        console.warn(`[Attendee] ⚠️ Still no transcripts after ${this.pollCount} polls. Transcription state: in_progress.`);
        console.warn('[Attendee] Possible reasons:');
        console.warn('[Attendee]   1. Deepgram buffers audio - transcripts only appear AFTER pauses (5-10 seconds)');
        console.warn('[Attendee]   2. Try speaking in complete sentences and pausing between them');
        console.warn('[Attendee]   3. No one is speaking (even if not muted)');
        console.warn('[Attendee]   4. Audio quality issues - speak clearly into microphone');
        console.warn('[Attendee]   5. For real-time transcripts, use webhooks (requires HTTPS URL via ngrok)');
        console.warn('[Attendee]   6. Check Attendee.ai dashboard for bot status and errors');
        
        // Also check bot info one more time
        try {
          const botInfo = await this.getBotInfo();
          console.warn('[Attendee] Bot status:', {
            state: botInfo.state,
            transcription_state: botInfo.transcription_state,
            events_count: botInfo.events?.length || 0,
            has_events: !!(botInfo.events && botInfo.events.length > 0)
          });
        } catch (e) {
          // Ignore
        }
      }
    } catch (error) {
      console.error('[Attendee] Error polling transcript:', error);
      // Log full error details for debugging
      if (error.message) {
        console.error('[Attendee] Error message:', error.message);
      }
      // Don't stop polling on error, just log it
    }
  }

  /**
   * Process transcript entries and emit updates
   */
  processTranscriptEntries(entries) {
    if (!entries || entries.length === 0) {
      return;
    }

    // Use a more robust method to track processed entries
    // Create unique ID from timestamp_ms + speaker_name + transcript text (first 100 chars + hash of full text)
    const processedIds = new Set(
      this.transcriptEntries.map(e => {
        const ts = e.timestamp || e.timestamp_ms || 0;
        const speaker = e.speakerName || 'Unknown';
        const text = (e.transcription || '').trim();
        // Use first 100 chars + simple hash of full text for uniqueness
        const textHash = text.length > 0 ? text.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0) : 0;
        return `${ts}-${speaker}-${text.substring(0, 100)}-${textHash}`;
      })
    );

    // Find new entries by comparing composite IDs
    const newEntries = entries.filter(entry => {
      const timestamp = entry.timestamp_ms || entry.timestamp || 0;
      const speakerName = entry.speaker_name || entry.speakerName || 'Unknown';
      
      // Extract transcript text to create unique identifier
      let transcriptText = '';
      if (entry.transcription) {
        transcriptText = typeof entry.transcription === 'string' 
          ? entry.transcription 
          : (entry.transcription.transcript || entry.transcription.text || '');
      } else {
        transcriptText = entry.text || entry.transcript || '';
      }
      
      transcriptText = transcriptText.trim();
      if (!transcriptText) {
        return false; // Skip empty transcripts
      }
      
      // Create composite ID: timestamp + speaker + first 100 chars + hash of full text
      const textHash = transcriptText.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
      const uniqueId = `${timestamp}-${speakerName}-${transcriptText.substring(0, 100)}-${textHash}`;
      return !processedIds.has(uniqueId);
    });

    if (newEntries.length === 0) {
      return; // No new entries
    }

    console.log(`[Attendee] Processing ${newEntries.length} new transcript entries`);

    // Process and emit new entries
    newEntries.forEach(entry => {
      if (this.onTranscriptUpdate) {
        // Extract transcript text - handle nested structure from Attendee API
        let transcriptText = '';
        if (entry.transcription) {
          // Handle nested transcription object: { transcript: "text", words: [...] }
          transcriptText = typeof entry.transcription === 'string' 
            ? entry.transcription 
            : (entry.transcription.transcript || entry.transcription.text || '');
        } else {
          // Fallback to direct text field
          transcriptText = entry.text || entry.transcript || '';
        }
        
        // Skip empty transcripts
        if (!transcriptText || !transcriptText.trim()) {
          return;
        }
        
        // Format entry according to Attendee.ai API response
        const formattedEntry = {
          speakerName: entry.speaker_name || entry.speakerName || 'Unknown',
          speakerUuid: entry.speaker_uuid || entry.speakerUuid || null,
          timestamp: entry.timestamp_ms || entry.timestamp || 0,
          duration: entry.duration_ms || entry.duration || 0,
          transcription: transcriptText.trim(),
          isFinal: entry.is_final !== false // Default to true for transcript entries
        };

        // Store processed entry with composite ID for deduplication
        const textHash = formattedEntry.transcription.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
        const entryId = `${formattedEntry.timestamp}-${formattedEntry.speakerName}-${formattedEntry.transcription.substring(0, 100)}-${textHash}`;
        this.transcriptEntries.push({
          id: entryId,
          timestamp: formattedEntry.timestamp,
          timestamp_ms: formattedEntry.timestamp,
          speakerName: formattedEntry.speakerName,
          transcription: formattedEntry.transcription
        });

        // Emit update
        this.onTranscriptUpdate(formattedEntry);
      }
    });
  }

  /**
   * Stop transcription
   */
  async stopTranscription() {
    try {
      console.log('Stopping transcription...');

      this.isActive = false;

      // Stop polling
      if (this.pollInterval) {
        clearInterval(this.pollInterval);
        this.pollInterval = null;
      }

      // Stop webhook polling
      if (this.webhookPollInterval) {
        clearInterval(this.webhookPollInterval);
        this.webhookPollInterval = null;
      }

      // Stop API fallback polling
      if (this.apiFallbackInterval) {
        clearInterval(this.apiFallbackInterval);
        this.apiFallbackInterval = null;
      }

      if (this.onBotStatusChange) {
        this.onBotStatusChange({ status: 'stopped', botId: this.botId });
      }

      console.log('✅ Transcription stopped');
      return true;
    } catch (error) {
      console.error('Error stopping transcription:', error);
      throw error;
    }
  }

  /**
   * Get bot status/info
   */
  async getBotInfo() {
    try {
      if (!this.botId) {
        throw new Error('Bot ID is required');
      }

      // Use proxy server to avoid CORS issues in browser
      const url = this.useProxy
        ? `${this.proxyServerUrl}/api/attendee/bots/${this.botId}`
        : `${this.baseUrl}/bots/${this.botId}`;
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Add API key to headers (proxy expects it in x-attendee-api-key or Authorization)
      if (this.useProxy) {
        headers['x-attendee-api-key'] = this.apiKey;
        // Add ngrok bypass header if using ngrok-free.app or ngrok-free.dev
        if (this.proxyServerUrl && (this.proxyServerUrl.includes('ngrok-free.app') || this.proxyServerUrl.includes('ngrok-free.dev'))) {
          headers['ngrok-skip-browser-warning'] = 'true';
        }
      } else {
        headers['Authorization'] = `Token ${this.apiKey}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });

      if (!response.ok) {
        throw new Error(`Failed to get bot info: ${response.status} ${response.statusText}`);
      }

      // Check if response is HTML (ngrok warning page) - clone response to peek without consuming
      let botInfo;
      try {
        // Clone response to check content without consuming the original
        const clonedResponse = response.clone();
        const text = await clonedResponse.text();
        
        // Check if it's HTML (ngrok warning page)
        if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html') || text.includes('ngrok') || text.includes('You are about to visit')) {
          console.error('[Attendee] Received HTML instead of JSON (likely ngrok warning page):', text.substring(0, 300));
          throw new Error('Received HTML response instead of JSON. ngrok is showing a warning page. The ngrok-skip-browser-warning header should bypass this. Try visiting the ngrok URL in your browser first to clear the warning.');
        }
        
        // Parse as JSON
        botInfo = await response.json();
      } catch (error) {
        // If it's already our custom error, re-throw it
        if (error.message && error.message.includes('Received HTML response')) {
          throw error;
        }
        // If JSON parse failed, it might be HTML
        if (error.message && error.message.includes('JSON')) {
          console.error('[Attendee] Error parsing response as JSON:', error.message);
          throw new Error(`Failed to parse bot info response as JSON. This might be due to ngrok showing a warning page. Error: ${error.message}`);
        }
        // Re-throw other errors
        throw error;
      }
      
      // Only log events if there are transcript events (reduce spam)
      if (botInfo.events && Array.isArray(botInfo.events) && botInfo.events.length > 0) {
        // Check for transcript events first
        const transcriptEvents = botInfo.events.filter(e => {
          const eventStr = JSON.stringify(e).toLowerCase();
          return eventStr.includes('transcript') || 
                 eventStr.includes('transcription') ||
                 e.type === 'transcript.update' || 
                 e.trigger === 'transcript.update' || 
                 e.event_type === 'transcript.update' || 
                 e.data?.transcription ||
                 e.data?.transcript;
        });
        
        if (transcriptEvents.length > 0) {
          console.log(`[Attendee] ✅ Found ${transcriptEvents.length} transcript event(s) in bot events!`);
          console.log('[Attendee] Processing transcript events...');
          // Process events as transcripts
          this.processBotEventsAsTranscripts(transcriptEvents);
        }
        // Don't log "No transcript events" - it's too verbose
      }
      
      return botInfo;
    } catch (error) {
      console.error('Error getting bot info:', error);
      throw error;
    }
  }

  /**
   * Process bot events as transcript entries (fallback when transcript endpoint is empty)
   */
  processBotEventsAsTranscripts(events) {
    if (!events || events.length === 0) return;
    
    events.forEach(event => {
      try {
        // Extract transcript data from various event structures
        let transcriptData = null;
        
        if (event.data?.transcription) {
          transcriptData = event.data.transcription;
        } else if (event.data?.transcript) {
          transcriptData = event.data.transcript;
        } else if (event.transcription) {
          transcriptData = event.transcription;
        } else if (event.transcript) {
          transcriptData = event.transcript;
        } else if (event.data) {
          // Check if data itself is the transcript
          transcriptData = event.data;
        }
        
        if (!transcriptData) {
          return; // Skip if no transcript data found
        }
        
        // Extract transcript text
        let transcriptText = '';
        if (typeof transcriptData === 'string') {
          transcriptText = transcriptData;
        } else if (transcriptData.transcript) {
          transcriptText = transcriptData.transcript;
        } else if (transcriptData.text) {
          transcriptText = transcriptData.text;
        }
        
        if (!transcriptText || !transcriptText.trim()) {
          return; // Skip empty transcripts
        }
        
        // Format as transcript entry
        const formattedEntry = {
          speakerName: event.data?.speaker_name || event.data?.speakerName || event.speaker_name || 'Unknown',
          speakerUuid: event.data?.speaker_uuid || event.data?.speakerUuid || event.speaker_uuid || null,
          timestamp: event.data?.timestamp_ms || event.data?.timestamp || event.timestamp_ms || event.timestamp || Date.now(),
          duration: event.data?.duration_ms || event.data?.duration || event.duration_ms || event.duration || 0,
          transcription: transcriptText.trim(),
          isFinal: true,
          words: transcriptData.words || event.data?.transcription?.words || null
        };
        
        console.log(`[Attendee] ✅ Extracted transcript from event: ${formattedEntry.speakerName}: "${transcriptText.substring(0, 50)}${transcriptText.length > 50 ? '...' : ''}"`);
        
        // Emit transcript update
        if (this.onTranscriptUpdate) {
          this.onTranscriptUpdate(formattedEntry);
        }
        
        // Track as processed
        this.transcriptEntries.push({
          timestamp: formattedEntry.timestamp || `${formattedEntry.speakerName}-${formattedEntry.transcription}`,
          speakerName: formattedEntry.speakerName,
          transcription: formattedEntry.transcription
        });
        
      } catch (error) {
        console.warn('[Attendee] Error processing event as transcript:', error);
      }
    });
  }

  /**
   * Periodically check bot status to monitor when transcription starts
   */
  checkBotStatusPeriodically() {
    // Check status every 5 seconds for first 30 seconds
    let checkCount = 0;
    const maxChecks = 6; // 6 checks * 5 seconds = 30 seconds
    
    const statusCheckInterval = setInterval(async () => {
      if (!this.isActive || !this.botId || checkCount >= maxChecks) {
        clearInterval(statusCheckInterval);
        return;
      }
      
      try {
        const botInfo = await this.getBotInfo();
        const state = botInfo.state || botInfo.status;
        const transcriptionState = botInfo.transcription_state;
        
        checkCount++;
        // Only log every 2nd check to reduce console spam
        if (checkCount % 2 === 0) {
          console.log(`[Attendee] Bot status check #${checkCount}: state=${state}, transcription_state=${transcriptionState}`);
        }
        
        // Log when transcription actually starts
        if (transcriptionState === 'active' || transcriptionState === 'started' || transcriptionState === 'transcribing') {
          console.log('[Attendee] ✅ Transcription has started!');
          clearInterval(statusCheckInterval);
        } else if (state === 'active' && transcriptionState === 'not_started') {
          // Only log this warning once
          if (checkCount === 1) {
            console.log('[Attendee] ⚠️ Bot is active but transcription not started yet');
          }
        }
      } catch (error) {
        console.warn('[Attendee] Error checking bot status:', error.message);
        checkCount++;
      }
    }, 5000); // Check every 5 seconds
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.stopTranscription();
    this.botId = null;
    this.meetingUrl = null;
    this.transcriptEntries = [];
    this.onTranscriptUpdate = null;
    this.onBotStatusChange = null;
    this.onError = null;
  }
}
