/**
 * Google Meet Transcript API Integration
 * Uses Google Meet API v2beta to fetch live transcripts
 * Reference: meet-proxy.js for API endpoints
 */

export class GoogleMeetTranscriptAPI {
  constructor(credentials) {
    this.credentials = credentials;
    this.proxyUrl = credentials?.proxyUrl || null;
    this.accessToken = null;
    this.isActive = false;
    this.pollInterval = null;
    this.conferenceRecord = null;
    this.transcript = null;
    this.lastEntryTime = null;
    
    // Event handlers
    this.onTranscriptUpdate = null;
    this.onError = null;
    
    // Polling interval (in milliseconds) - poll every 2 seconds for real-time updates
    this.pollIntervalMs = 2000;
    console.log('[GMTA] Constructed GoogleMeetTranscriptAPI', {
      proxyUrl: this.proxyUrl || 'http://localhost:8787'
    });
  }

  /**
   * Initialize authentication and get access token
   */
  async initializeAuth(accessToken) {
    try {
      console.log('[GMTA] Initializing Google Meet Transcript API...');
      
      if (!accessToken) {
        throw new Error('Access token is required for Google Meet API');
      }
      
      this.accessToken = accessToken;
      
      console.log('[GMTA] ✅ Google Meet Transcript API initialized');
      return true;
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      throw error;
    }
  }

  /**
   * Get access token from Meet Add-ons SDK session
   */
  async getAccessToken() {
    try {
      console.log('[GMTA] getAccessToken');
      // Try to get access token from Meet session
      if (this.credentials?.meetSession) {
        // Meet Add-ons SDK should provide access token via platform authentication
        // For now, we'll need the token to be passed explicitly
        // This could be enhanced to use the SDK's token mechanism
        return this.accessToken;
      }
      
      return this.accessToken;
    } catch (error) {
      console.error('[GMTA] Error getting access token:', error);
      return null;
    }
  }

  /**
   * Lookup space from meeting code
   * GET /api/lookupSpace?meetingCode=XXX
   */
  async lookupSpace(meetingCode) {
    try {
      console.log('[GMTA] lookupSpace start', { meetingCode });
      const token = await this.getAccessToken();
      if (!token) {
        throw new Error('Access token not available');
      }

      // Use proxy URL - default to localhost:8787 where meet-proxy.js runs
      const baseUrl = this.proxyUrl || 'http://localhost:8787';
      const url = `${baseUrl}/api/lookupSpace?meetingCode=${encodeURIComponent(meetingCode)}`;
      
      console.log('[GMTA] Looking up space via proxy:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-access-token': token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn('[GMTA] lookupSpace non-OK', { status: response.status, statusText: response.statusText, bodyPreview: errorText.substring(0,200) });
        throw new Error(`Failed to lookup space: ${response.status} ${response.statusText}. ${errorText}`);
      }

      const data = await response.json();
      console.log('[GMTA] ✅ Space lookup successful:', data);
      return data;
    } catch (error) {
      console.error('[GMTA] Error looking up space:', error);
      throw error;
    }
  }

  /**
   * Verify space exists and return its metadata
   * GET /api/verifySpace?spaceName=spaces/XXX
   */
  async verifySpace(spaceName) {
    try {
      const token = await this.getAccessToken();
      if (!token) {
        throw new Error('Access token not available');
        console.error('Error getting access token:', error);
      }
      console.log('Access token:', token);
      console.log('Space name:', spaceName);
      console.log('Proxy URL:', this.proxyUrl);
      const baseUrl = this.proxyUrl || 'http://localhost:8787';
      const url = `${baseUrl}/api/verifySpace?spaceName=${encodeURIComponent(spaceName)}`;
      console.log('URL:', url);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-access-token': token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to verify space: ${response.status} ${response.statusText}. ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Propagate error; caller will decide on fallback
      throw error;
    }
  }

  /**
   * Get conference records for a space
   * GET /api/conferenceRecords?spaceName=spaces/XXX
   */
  async getConferenceRecords(spaceName) {
    try {
      console.log('[GMTA] getConferenceRecords start', { spaceName });
      const token = await this.getAccessToken();
      if (!token) {
        throw new Error('Access token not available');
      }

      // Use proxy URL - default to localhost:8787 where meet-proxy.js runs
      const baseUrl = this.proxyUrl || 'http://localhost:8787';
      const url = `${baseUrl}/api/conferenceRecords?spaceName=${encodeURIComponent(spaceName)}`;
      
      console.log('[GMTA] Fetching conference records via proxy:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-access-token': token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn('[GMTA] getConferenceRecords non-OK', { status: response.status, statusText: response.statusText, bodyPreview: errorText.substring(0,200) });
        throw new Error(`Failed to get conference records: ${response.status} ${response.statusText}. ${errorText}`);
      }

      const data = await response.json();
      console.log('[GMTA] ✅ Conference records fetched:', data);
      return data;
    } catch (error) {
      console.error('[GMTA] Error getting conference records:', error);
      throw error;
    }
  }

  /**
   * Get transcripts for a conference record
   * GET /api/transcripts?conferenceRecord=conferenceRecords/XXX
   */
  async getTranscripts(conferenceRecord) {
    try {
      console.log('[GMTA] getTranscripts start', { conferenceRecord });
      const token = await this.getAccessToken();
      if (!token) {
        throw new Error('Access token not available');
      }

      // Use proxy URL - default to localhost:8787 where meet-proxy.js runs
      const baseUrl = this.proxyUrl || 'http://localhost:8787';
      const url = `${baseUrl}/api/transcripts?conferenceRecord=${encodeURIComponent(conferenceRecord)}`;
      
      console.log('[GMTA] Fetching transcripts via proxy:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-access-token': token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn('[GMTA] getTranscripts non-OK', { status: response.status, statusText: response.statusText, bodyPreview: errorText.substring(0,200) });
        throw new Error(`Failed to get transcripts: ${response.status} ${response.statusText}. ${errorText}`);
      }

      const data = await response.json();
      console.log('[GMTA] ✅ Transcripts fetched:', data);
      return data;
    } catch (error) {
      console.error('[GMTA] Error getting transcripts:', error);
      throw error;
    }
  }

  /**
   * Get transcript entries (live updates)
   * GET /api/transcripts/entries?transcript=conferenceRecords/XXX/transcripts/XXX
   */
  async getTranscriptEntries(transcriptName) {
    try {
      console.log('[GMTA] getTranscriptEntries start', { transcriptName });
      const token = await this.getAccessToken();
      if (!token) {
        throw new Error('Access token not available');
      }

      // Use proxy URL - default to localhost:8787 where meet-proxy.js runs
      const baseUrl = this.proxyUrl || 'http://localhost:8787';
      const url = `${baseUrl}/api/transcripts/entries?transcript=${encodeURIComponent(transcriptName)}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-access-token': token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn('[GMTA] getTranscriptEntries non-OK', { status: response.status, statusText: response.statusText, bodyPreview: errorText.substring(0,200) });
        throw new Error(`Failed to get transcript entries: ${response.status} ${response.statusText}. ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[GMTA] Error getting transcript entries:', error);
      throw error;
    }
  }

  /**
   * Extract meeting code from meeting URL
   */
  extractMeetingCode(meetingUrl) {
    try {
      // Extract from URL like: https://meet.google.com/abc-defg-hij
      const match = meetingUrl.match(/meet\.google\.com\/([a-z0-9-]+)/i);
      if (match && match[1]) {
        return match[1];
      }
      // If it's already a code
      if (/^[a-z]{3}-[a-z]{4}-[a-z]{3}$/i.test(meetingUrl)) {
        return meetingUrl;
      }
      return null;
    } catch (error) {
      console.error('Error extracting meeting code:', error);
      return null;
    }
  }

  /**
   * Start live transcription
   */
  async startTranscription(meetingCodeOrUrl, accessToken) {
    try {
      console.log('[GMTA] Starting Google Meet transcript API...');
      
      // Initialize auth - accessToken is required
      if (!accessToken) {
        throw new Error('Access token is required. Please authenticate first.');
      }
      
      await this.initializeAuth(accessToken);
      
      // Extract meeting code
      const meetingCode = this.extractMeetingCode(meetingCodeOrUrl) || meetingCodeOrUrl;
      if (!meetingCode) {
        throw new Error('Could not extract meeting code from URL');
      }
      
      console.log('[GMTA] Meeting code:', meetingCode);
      
      // Step 1: Lookup space, with fallbacks
      let spaceName = null;
      try {
        const spaceData = await this.lookupSpace(meetingCode);
        spaceName = spaceData?.name || spaceData?.spaceName || null;
      } catch (lookupErr) {
        // Fallback 1: try typical resource naming using the meeting code
        const candidates = [
          `spaces/${meetingCode}`,
          `spaces/${(meetingCode || '').replace(/-/g, '')}`
        ];
        for (const candidate of candidates) {
          try {
            await this.verifySpace(candidate);
            spaceName = candidate;
            break;
          } catch (_) {}
        }

        if (!spaceName) {
          throw lookupErr;
        }
      }
      if (!spaceName) {
        throw new Error('Could not get space name from lookup');
      }
      
      console.log('[GMTA] ✅ Space name:', spaceName);
      
      // Step 2: Get conference records
      const recordsData = await this.getConferenceRecords(spaceName);
      const conferenceRecords = recordsData?.conferenceRecords || [];
      if (conferenceRecords.length === 0) {
        throw new Error('No conference records found. Make sure the meeting is active.');
      }
      
      // Get the most recent/latest conference record
      const latestRecord = conferenceRecords[0]; // Usually the first one is the latest
      this.conferenceRecord = latestRecord?.name || latestRecord?.conferenceRecord;
      if (!this.conferenceRecord) {
        throw new Error('Could not get conference record');
      }
      
      console.log('[GMTA] ✅ Conference record:', this.conferenceRecord);
      
      // Step 3: Get transcripts
      const transcriptsData = await this.getTranscripts(this.conferenceRecord);
      const transcripts = transcriptsData?.transcripts || [];
      if (transcripts.length === 0) {
        throw new Error('No transcripts found. Transcription may not be enabled for this meeting.');
      }
      
      // Get the active/latest transcript
      const latestTranscript = transcripts[0]; // Usually the first one is the latest
      this.transcript = latestTranscript?.name || latestTranscript?.transcript;
      if (!this.transcript) {
        throw new Error('Could not get transcript');
      }
      
      console.log('[GMTA] ✅ Transcript:', this.transcript);
      
      // Start polling for transcript entries
      this.isActive = true;
      this.startPolling();
      
      console.log('[GMTA] ✅ Live transcription started successfully');
      return true;
    } catch (error) {
      console.error('[GMTA] Error starting transcription:', error);
      this.isActive = false;
      if (this.onError) {
        this.onError(error);
      }
      throw error;
    }
  }

  /**
   * Start polling for transcript entries
   */
  startPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }

    // Poll immediately
    console.log('[GMTA] startPolling now');
    this.pollTranscriptEntries();

    // Then poll at regular intervals
    this.pollInterval = setInterval(() => {
      this.pollTranscriptEntries();
    }, this.pollIntervalMs);
  }

  /**
   * Poll for new transcript entries
   */
  async pollTranscriptEntries() {
    try {
      if (!this.isActive || !this.transcript) {
        console.log('[GMTA] pollTranscriptEntries skipped (inactive or no transcript)');
        return;
      }

      const entriesData = await this.getTranscriptEntries(this.transcript);
      const entries = entriesData?.entries || entriesData?.transcriptEntries || [];
      
      // Process new entries (only ones after lastEntryTime)
      const newEntries = entries.filter(entry => {
        if (!this.lastEntryTime) return true;
        
        // Check entry start time
        const entryTime = entry.startTime || entry.startOffset || entry.timestamp;
        if (!entryTime) return true;
        
        // Compare timestamps
        const entryTimeMs = this.parseTimeToMs(entryTime);
        return entryTimeMs > this.lastEntryTime;
      });

      // Process new entries
      if (newEntries.length > 0) {
        this.processTranscriptEntries(newEntries);
        
        // Update last entry time
        const lastEntry = newEntries[newEntries.length - 1];
        const lastEntryTime = lastEntry.startTime || lastEntry.startOffset || lastEntry.timestamp;
        if (lastEntryTime) {
          this.lastEntryTime = this.parseTimeToMs(lastEntryTime);
        }
      }
    } catch (error) {
      console.error('[GMTA] Error polling transcript entries:', error);
      // Don't stop polling on error, just log it
    }
  }

  /**
   * Parse time string to milliseconds
   */
  parseTimeToMs(timeString) {
    try {
      // Handle different time formats
      if (typeof timeString === 'number') {
        return timeString;
      }
      
      // Format: "123.456s" or "123456ms" or ISO string
      if (timeString.endsWith('s')) {
        return parseFloat(timeString) * 1000;
      }
      if (timeString.endsWith('ms')) {
        return parseFloat(timeString);
      }
      if (timeString.includes('T')) {
        // ISO format
        return new Date(timeString).getTime();
      }
      
      // Try parsing as number
      return parseFloat(timeString);
    } catch (error) {
      console.warn('Error parsing time:', timeString, error);
      return Date.now();
    }
  }

  /**
   * Process transcript entries and emit updates
   */
  processTranscriptEntries(entries) {
    entries.forEach(entry => {
      if (this.onTranscriptUpdate) {
        // Format entry according to Google Meet API response
        const formattedEntry = {
          speakerName: entry.participant?.displayName || entry.participant?.name || entry.speaker || 'Unknown',
          speakerId: entry.participant?.id || entry.participantId || null,
          timestamp: entry.startTime || entry.startOffset || entry.timestamp || 0,
          duration: entry.endTime ? (this.parseTimeToMs(entry.endTime) - this.parseTimeToMs(entry.startTime || entry.startOffset || 0)) : (entry.duration || 0),
          transcription: entry.text || entry.transcript || entry.transcription || '',
          isFinal: entry.isFinal !== false, // Default to true for transcript entries
          confidence: entry.confidence || 1.0
        };

        if (formattedEntry.transcription && formattedEntry.transcription.trim()) {
          this.onTranscriptUpdate(formattedEntry);
        }
      }
    });
  }

  /**
   * Stop transcription
   */
  async stopTranscription() {
    try {
      console.log('[GMTA] Stopping transcription...');

      this.isActive = false;

      // Stop polling
      if (this.pollInterval) {
        clearInterval(this.pollInterval);
        this.pollInterval = null;
      }

      this.conferenceRecord = null;
      this.transcript = null;
      this.lastEntryTime = null;

      console.log('[GMTA] ✅ Transcription stopped');
      return true;
    } catch (error) {
      console.error('[GMTA] Error stopping transcription:', error);
      throw error;
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.stopTranscription();
    this.accessToken = null;
    this.onTranscriptUpdate = null;
    this.onError = null;
  }
}
