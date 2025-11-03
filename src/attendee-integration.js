/**
 * Attendee.ai Integration
 * Provides real-time transcription using Attendee.ai Meeting Bot API
 * https://docs.attendee.dev/guides/transcription
 */

export class AttendeeIntegration {
  constructor(apiKey, credentials) {
    this.apiKey = apiKey;
    this.credentials = credentials;
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
      // Try to get meeting URL from various sources
      
      // Method 1: From browser URL
      const currentUrl = window.location.href;
      if (currentUrl.includes('meet.google.com')) {
        // Extract meeting code from URL like: https://meet.google.com/abc-defg-hij
        const match = currentUrl.match(/meet\.google\.com\/([a-z-]+)/i);
        if (match) {
          const meetingCode = match[1];
          return `https://meet.google.com/${meetingCode}`;
        }
      }
      
      // Method 2: From Meet Add-ons SDK session
      if (this.credentials?.meetSession) {
        try {
          const meetingInfo = await this.credentials.meetSession.getMeetingInfo?.();
          if (meetingInfo?.meetingUrl) {
            return meetingInfo.meetingUrl;
          }
          if (meetingInfo?.meetingCode) {
            return `https://meet.google.com/${meetingInfo.meetingCode}`;
          }
        } catch (err) {
          console.warn('Could not get meeting URL from Meet session:', err);
        }
      }
      
      // Method 3: Try to find in DOM
      const meetLinks = document.querySelectorAll('a[href*="meet.google.com"]');
      if (meetLinks.length > 0) {
        const href = meetLinks[0].href;
        return href.split('?')[0]; // Remove query params
      }
      
      // Fallback: Return null and let user provide it
      console.warn('Could not automatically detect meeting URL');
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
          throw new Error('Could not detect meeting URL. Please provide it manually.');
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
