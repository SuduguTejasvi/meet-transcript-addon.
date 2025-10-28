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
   */
  async getCurrentParticipants() {
    try {
      if (!this.meetSession) {
        throw new Error('Meet session not initialized');
      }
      
      // Use Meet Add-ons SDK to get participants
      const participants = await this.meetSession.getParticipants();
      console.log('Real participants from Meet SDK:', participants);
      
      return participants || [];
    } catch (error) {
      console.error('Error getting current participants:', error);
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
      
      // Use Meet Add-ons SDK to get meeting info
      const meetingInfo = await this.meetSession.getMeetingInfo();
      console.log('Meeting info from Meet SDK:', meetingInfo);
      
      return meetingInfo || {};
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
      
      // Get current participants
      const participants = await this.getCurrentParticipants();
      
      console.log('Participants from Meet SDK:', participants);
      
      // Process each participant
      if (participants && participants.length > 0) {
        participants.forEach(participant => {
          this.handleParticipantJoined(participant);
        });
      } else {
        console.log('No participants found in the meeting');
      }
      
      console.log('✅ Participant tracking started with Meet Add-ons SDK');
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
      
      // Note: Direct audio access is not available in Meet Add-ons iframe
      // This would require Meet Media API with Developer Preview enrollment
      console.log('⚠️ Direct audio access not available in Meet Add-ons iframe');
      console.log('📋 Audio monitoring would require Meet Media API with Developer Preview');
      
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