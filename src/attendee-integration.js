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
    this.useWebhooks = false; // Whether to use webhooks instead of polling
    this.webhookUrl = null; // Webhook URL for bot creation
    this.webhookPollInterval = null; // Polling interval for webhook transcripts
    this.lastWebhookTimestamp = 0; // Last timestamp we fetched from webhook endpoint
    
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
    
    // Polling interval (in milliseconds) - poll every 2 seconds for real-time updates
    this.pollIntervalMs = 2000;
    // Webhook polling interval (faster since webhooks are more real-time)
    this.webhookPollIntervalMs = 500;
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

      // Add webhooks if configured
      if (this.useWebhooks && this.webhookUrl) {
        requestBody.webhooks = [
          {
            url: this.webhookUrl,
            triggers: ['transcript.update', 'bot.state_change']
          }
        ];
        console.log('Using webhooks for real-time updates:', this.webhookUrl);
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
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Add API key to headers (proxy expects it in x-attendee-api-key or Authorization)
      if (this.useProxy) {
        headers['x-attendee-api-key'] = this.apiKey;
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
        throw new Error(`Failed to create bot: ${response.status} ${response.statusText}. ${errorData.message || errorData.detail || ''}`);
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
  async getTranscript() {
    try {
      if (!this.botId) {
        throw new Error('Bot ID is required. Create a bot first.');
      }

      // Use proxy server to avoid CORS issues in browser
      const url = this.useProxy
        ? `${this.proxyServerUrl}/api/attendee/bots/${this.botId}/transcript`
        : `${this.baseUrl}/bots/${this.botId}/transcript`;
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Add API key to headers (proxy expects it in x-attendee-api-key or Authorization)
      if (this.useProxy) {
        headers['x-attendee-api-key'] = this.apiKey;
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

      const transcriptData = await response.json();
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
      this.pollCount = 0; // Reset poll count

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

      if (this.useWebhooks && effectiveWebhookUrl) {
        console.log('Starting webhook-based transcription polling...');
        // Poll webhook endpoint on proxy server
        this.startWebhookPolling();
      } else {
        console.log('Starting API-based transcription polling...');
        // Poll Attendee API directly
        this.startPolling();
      }

      if (this.onBotStatusChange) {
        this.onBotStatusChange({ status: 'active', botId: this.botId });
      }

      // Log initial state
      console.log('[Attendee] Transcription active. Waiting for transcripts...');
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
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn('Error polling webhook transcripts:', response.status);
        return;
      }

      const data = await response.json();
      const newTranscripts = data.transcripts || [];

      if (newTranscripts.length > 0) {
        // Process new transcript entries
        newTranscripts.forEach(entry => {
          if (entry.type === 'bot_state_change') {
            // Handle bot state change
            if (this.onBotStatusChange) {
              this.onBotStatusChange({
                status: entry.newState,
                oldStatus: entry.oldState,
                eventType: entry.eventType,
                botId: entry.botId
              });
            }
          } else if (entry.transcription) {
            // Handle transcript update
            if (this.onTranscriptUpdate) {
              const formattedEntry = {
                speakerName: entry.speakerName || 'Unknown',
                speakerUuid: entry.speakerUuid || null,
                timestamp: entry.timestamp || 0,
                duration: entry.duration || 0,
                transcription: entry.transcription,
                words: entry.words || null,
                isFinal: true // Webhook transcripts are always final
              };
              this.onTranscriptUpdate(formattedEntry);
            }
          }
        });

        // Update last timestamp
        if (data.latestTimestamp > this.lastWebhookTimestamp) {
          this.lastWebhookTimestamp = data.latestTimestamp;
        }
      }
    } catch (error) {
      console.error('Error polling webhook transcripts:', error);
      // Don't stop polling on error, just log it
    }
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

      const transcriptData = await this.getTranscript();
      
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
      }

      // Log for debugging (first few calls)
      if (this.pollCount === undefined) this.pollCount = 0;
      this.pollCount++;
      if (this.pollCount <= 3 || entries.length > 0) {
        console.log(`[Attendee] Poll #${this.pollCount}: Found ${entries.length} transcript entries`);
        if (entries.length > 0) {
          console.log('[Attendee] Sample entry:', JSON.stringify(entries[0], null, 2));
        }
      }

      // Process new entries
      if (entries.length > 0) {
        this.processTranscriptEntries(entries);
      }
    } catch (error) {
      console.error('Error polling transcript:', error);
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
    // Use timestamp_ms as unique identifier instead of array index
    const processedTimestamps = new Set(
      this.transcriptEntries.map(e => e.timestamp || e.timestamp_ms || `${e.speakerName}-${e.transcription}`)
    );

    // Find new entries by comparing timestamps or content
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
      
      const uniqueId = timestamp || `${speakerName}-${transcriptText}`;
      return !processedTimestamps.has(uniqueId);
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

        // Store processed entry
        this.transcriptEntries.push({
          timestamp: formattedEntry.timestamp || `${formattedEntry.speakerName}-${formattedEntry.transcription}`,
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

      return await response.json();
    } catch (error) {
      console.error('Error getting bot info:', error);
      throw error;
    }
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
