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
    
    // Event handlers
    this.onTranscriptUpdate = null;
    this.onBotStatusChange = null;
    this.onError = null;
    
    // API base URL
    this.baseUrl = 'https://app.attendee.dev/api/v1';
    
    // Polling interval (in milliseconds) - poll every 2 seconds for real-time updates
    this.pollIntervalMs = 2000;
  }

  /**
   * Get the current meeting URL from Google Meet session
   */
  async getMeetingUrl() {
    try {
      console.log('Attempting to detect meeting URL...');
      
      // Method 1: Try using sidePanelClient or mainStageClient to get meeting info
      if (this.sidePanelClient) {
        try {
          const meetingInfo = await this.sidePanelClient.getMeetingInfo?.();
          console.log('Meeting info from sidePanelClient:', meetingInfo);
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
        } catch (err) {
          console.warn('Could not get meeting URL from sidePanelClient:', err);
        }
      }
      
      if (this.mainStageClient) {
        try {
          const meetingInfo = await this.mainStageClient.getMeetingInfo?.();
          console.log('Meeting info from mainStageClient:', meetingInfo);
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
        } catch (err) {
          console.warn('Could not get meeting URL from mainStageClient:', err);
        }
      }
      
      // Method 2: From Meet Add-ons SDK session
      if (this.credentials?.meetSession) {
        try {
          const meetingInfo = await this.credentials.meetSession.getMeetingInfo?.();
          console.log('Meeting info from meetSession:', meetingInfo);
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
        } catch (err) {
          console.warn('Could not get meeting URL from Meet session:', err);
        }
      }
      
      // Method 3: Try to access parent window URL (if in iframe)
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
      
      // Method 4: Try document.referrer
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
      
      // Method 5: From current browser URL
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
      
      // Method 6: Try to find in DOM
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
      
      // Fallback: Try to extract from URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const meetingCode = urlParams.get('meetingCode') || urlParams.get('meeting') || urlParams.get('code');
      if (meetingCode) {
        const url = `https://meet.google.com/${meetingCode}`;
        console.log('✅ Found meeting URL from URL params:', url);
        return url;
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
          // As a last resort, try to prompt for manual entry or use a fallback
          // For now, we'll throw an error with helpful instructions
          throw new Error('Could not automatically detect meeting URL. The add-on needs access to the Google Meet URL. Please ensure you are running this from within a Google Meet session, or contact support if the issue persists.');
        }
      }

      this.meetingUrl = meetingUrl;
      console.log('Creating Attendee.ai bot for meeting:', meetingUrl);

      const response = await fetch(`${this.baseUrl}/bots`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          meeting_url: meetingUrl,
          // Optional: Configure transcription settings
          transcription_settings: {
            deepgram: {
              language: 'en-US',
              model: 'nova-2',
              punctuate: true,
              smart_format: true
            }
          }
        })
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

      const response = await fetch(`${this.baseUrl}/bots/${this.botId}/transcript`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
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
   * Start live transcription polling
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

      console.log('Starting live transcription polling...');

      // Start polling for transcript updates
      this.startPolling();

      if (this.onBotStatusChange) {
        this.onBotStatusChange({ status: 'active', botId: this.botId });
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
      
      // Handle different response formats
      let entries = [];
      if (Array.isArray(transcriptData)) {
        entries = transcriptData;
      } else if (transcriptData.entries || transcriptData.transcript) {
        entries = transcriptData.entries || transcriptData.transcript || [];
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
    // Track which entries we've already processed
    const existingCount = this.transcriptEntries.length;
    const newEntries = entries.slice(existingCount);

    // Update our stored entries
    this.transcriptEntries = entries;

    // Emit updates for new entries
    newEntries.forEach(entry => {
      if (this.onTranscriptUpdate) {
        // Format entry according to Attendee.ai API response
        const formattedEntry = {
          speakerName: entry.speaker_name || entry.speakerName || 'Unknown',
          speakerUuid: entry.speaker_uuid || entry.speakerUuid || null,
          timestamp: entry.timestamp_ms || entry.timestamp || 0,
          duration: entry.duration_ms || entry.duration || 0,
          transcription: entry.transcription || entry.text || '',
          isFinal: entry.is_final !== false // Default to true for transcript entries
        };

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

      const response = await fetch(`${this.baseUrl}/bots/${this.botId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
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
