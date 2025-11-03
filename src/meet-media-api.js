/**
 * Google Meet Add-ons SDK Integration
 * Uses the official Google Meet Add-ons SDK for participant and audio access
 */

export class MeetMediaAPI {
  constructor(credentials) {
    this.credentials = credentials;
    this.participants = new Map();
    this.isConnected = false;
    this.meetingId = null;
    this.meetSession = null;
    this.eventsBackendUrl = credentials?.eventsBackendUrl || null; // Optional backend to proxy Workspace Events/REST
    this.developerPreviewEnabled = true; // Caller should actually gate this based on enrollment
    
    // Event handlers
    this.onParticipantJoined = null;
    this.onParticipantLeft = null;
    this.onAudioData = null;
    this.onError = null;
  }

  /**
   * Initialize authentication with Google Meet Add-ons SDK
   */
  async initializeAuth() {
    try {
      console.log('Initializing Google Meet Add-ons SDK...');
      
      // Store reference to Meet SDK session
      this.meetSession = this.credentials.meetSession;
      
      if (!this.meetSession) {
        throw new Error('Meet session not available');
      }
      
      console.log('✅ Google Meet Add-ons SDK initialized');
      return true;
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      throw error;
    }
  }

  /**
   * Get current participants from the meeting using Meet Add-ons SDK
   * Note: The Meet Add-ons SDK has limited participant access
   */
  async getCurrentParticipants() {
    try {
      if (!this.meetSession) {
        throw new Error('Meet session not initialized');
      }
      
      // Try Workspace Events API (via backend proxy) if configured
      const eventsParticipants = await this.fetchParticipantsViaWorkspaceEvents();
      if (eventsParticipants && eventsParticipants.length > 0) {
        return eventsParticipants;
      }
      
      // Return empty array if no participants found (no mock data)
      console.log('⚠️ Meet Add-ons SDK has limited participant access');
      console.log('📋 No participants available via API');
      return [];
      
    } catch (error) {
      console.error('Error getting current participants:', error);
      return [];
    }
  }

  /**
   * Attempt to fetch participants via Google Workspace Events API through a backend proxy.
   * Notes:
   * - Workspace Events API is subscription/webhook based and cannot be called directly from the client.
   * - Provide credentials.eventsBackendUrl which exposes an endpoint
   *   like GET /participants?meetingId=... returning [{id, name, email, isLocal}].
   */
  async fetchParticipantsViaWorkspaceEvents() {
    try {
      if (!this.eventsBackendUrl) {
        return [];
      }

      // Determine a meeting ID from session if available
      const meetingInfo = (this.meetSession && this.meetSession.getMeetingInfo)
        ? await this.meetSession.getMeetingInfo()
        : null;
      const meetingId = meetingInfo?.meetingId || meetingInfo?.id || this.meetingId;
      if (!meetingId) {
        return [];
      }

      const url = `${this.eventsBackendUrl.replace(/\/$/, '')}/participants?meetingId=${encodeURIComponent(meetingId)}`;
      const res = await fetch(url, { method: 'GET', credentials: 'omit' });
      if (!res.ok) {
        console.warn('Workspace Events backend returned non-OK status:', res.status);
        return [];
      }
      const data = await res.json();
      if (!Array.isArray(data)) return [];
      // Normalize
      return data.map(p => ({
        id: p.id || p.participantId || p.name || `participant_${Math.random().toString(36).slice(2)}`,
        name: p.name || p.displayName || 'Unknown Participant',
        email: p.email || '',
        isLocal: !!p.isLocal,
        isSpeaking: false,
        avatar: '👤',
        transcript: '',
        lastSpoke: null,
        joinedAt: new Date().toISOString()
      }));
    } catch (err) {
      console.warn('Failed to fetch participants via Workspace Events backend:', err);
      return [];
    }
  }


  /**
   * Get meeting information using Meet Add-ons SDK
   */
  async getMeetingInfo() {
    try {
      if (!this.meetSession) {
        throw new Error('Meet session not initialized');
      }
      
      // The Meet Add-ons SDK has limited meeting info access
      console.log('⚠️ Meet Add-ons SDK has limited meeting info access');
      
      return {
        meetingId: this.meetingId || null,
        title: 'Google Meet Session',
        startTime: new Date().toISOString(),
        participantCount: this.participants.size
      };
      
    } catch (error) {
      console.error('Error getting meeting info:', error);
      return {};
    }
  }

  /**
   * Start participant tracking using Meet Add-ons SDK
   */
  async startParticipantTracking() {
    try {
      console.log('Starting participant tracking with Meet Add-ons SDK...');
      
      // Prefer real participants via Workspace Events API backend when available
      const participants = await this.getCurrentParticipants();
      
      console.log('Simulated participants:', participants);
      
      // Process each participant
      participants.forEach(participant => {
        this.handleParticipantJoined(participant);
      });
      
      console.log('✅ Participant tracking started');
    } catch (error) {
      console.error('Error starting participant tracking:', error);
      throw error;
    }
  }

  /**
   * Handle participant joined event
   */
  handleParticipantJoined(participant) {
    try {
      const participantData = {
        id: participant.id || participant.participantId || `participant_${Date.now()}`,
        name: participant.name || participant.displayName || 'Unknown Participant',
        email: participant.email || '',
        isLocal: participant.isLocal || false,
        isSpeaking: participant.isSpeaking || false,
        avatar: participant.avatar || '👤',
        transcript: '',
        lastSpoke: null,
        joinedAt: new Date().toISOString()
      };
      
      this.participants.set(participantData.id, participantData);
      
      console.log('Participant joined:', participantData);
      
      if (this.onParticipantJoined) {
        this.onParticipantJoined(participantData);
      }
    } catch (error) {
      console.error('Error handling participant joined:', error);
    }
  }

  /**
   * Handle participant left event
   */
  handleParticipantLeft(participantId) {
    try {
      const participant = this.participants.get(participantId);
      if (participant) {
        this.participants.delete(participantId);
        console.log('Participant left:', participant);
        
        if (this.onParticipantLeft) {
          this.onParticipantLeft(participant);
        }
      }
    } catch (error) {
      console.error('Error handling participant left:', error);
    }
  }

  /**
   * Get all participants
   */
  getAllParticipants() {
    return Array.from(this.participants.values());
  }

  /**
   * Get participant by ID
   */
  getParticipant(id) {
    return this.participants.get(id);
  }

  /**
   * Update participant speaking status
   */
  updateParticipantSpeaking(participantId, isSpeaking) {
    const participant = this.participants.get(participantId);
    if (participant) {
      participant.isSpeaking = isSpeaking;
      if (isSpeaking) {
        participant.lastSpoke = new Date().toISOString();
      }
      
      if (this.onParticipantJoined) {
        this.onParticipantJoined(participant);
      }
    }
  }

  /**
   * Update participant transcript
   */
  updateParticipantTranscript(participantId, transcript) {
    const participant = this.participants.get(participantId);
    if (participant) {
      participant.transcript = transcript;
      participant.lastSpoke = new Date().toISOString();
      
      if (this.onParticipantJoined) {
        this.onParticipantJoined(participant);
      }
    }
  }

  /**
   * Start audio monitoring (placeholder for future implementation)
   */
  async startAudioMonitoring() {
    try {
      console.log('Starting audio monitoring...');
      
      // Note: Direct audio access is not available in Meet Add-ons iframe.
      // Real-time audio requires Meet Media API with Developer Preview enrollment.
      if (!this.developerPreviewEnabled) {
        console.log('⚠️ Developer Preview not enabled. Skipping Meet Media API audio.');
        return true;
      }
      console.log('📋 Meet Media API audio capture requires a separate client (WebRTC) joining the call.');
      console.log('📋 Implement a backend or native client to join and forward audio to this add-on.');
      
      return true;
    } catch (error) {
      console.error('Error starting audio monitoring:', error);
      throw error;
    }
  }

  /**
   * Stop audio monitoring
   */
  async stopAudioMonitoring() {
    try {
      console.log('Stopping audio monitoring...');
      return true;
    } catch (error) {
      console.error('Error stopping audio monitoring:', error);
      throw error;
    }
  }

  /**
   * Leave the meeting
   */
  async leaveMeeting() {
    try {
      console.log('Leaving meeting...');
      
      this.participants.clear();
      this.isConnected = false;
      
      console.log('✅ Left meeting successfully');
      return true;
    } catch (error) {
      console.error('Error leaving meeting:', error);
      throw error;
    }
  }
}