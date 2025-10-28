/**
 * Google Meet Media API Integration
 * Uses the official Google Meet Media API for real-time audio/video access
 */

import { google } from 'googleapis';

export class MeetMediaAPI {
  constructor(credentials) {
    this.credentials = credentials;
    this.participants = new Map();
    this.audioStreams = new Map();
    this.isConnected = false;
    this.meetingId = null;
    this.meetAPI = null;
    this.auth = null;
    
    // Event handlers
    this.onParticipantJoined = null;
    this.onParticipantLeft = null;
    this.onAudioData = null;
    this.onError = null;
  }

  /**
   * Initialize authentication with Google Cloud Meet Media API
   */
  async initializeAuth() {
    try {
      console.log('Initializing Google Meet Media API authentication...');
      
      // Verify we have the required credentials
      if (!this.credentials.serviceAccountEmail || !this.credentials.clientId) {
        throw new Error('Missing required credentials');
      }
      
      // Set up OAuth2 authentication
      this.auth = new google.auth.OAuth2(
        this.credentials.clientId,
        this.credentials.clientSecret || '', // May not be needed for service account
        'urn:ietf:wg:oauth:2.0:oob' // Out-of-band redirect
      );
      
      // Set credentials (service account or OAuth tokens)
      if (this.credentials.privateKey) {
        // Service account authentication
        this.auth = new google.auth.GoogleAuth({
          credentials: {
            type: 'service_account',
            project_id: this.credentials.cloudProjectNumber,
            private_key_id: this.credentials.privateKeyId || '',
            private_key: this.credentials.privateKey,
            client_email: this.credentials.serviceAccountEmail,
            client_id: this.credentials.clientId,
            auth_uri: 'https://accounts.google.com/o/oauth2/auth',
            token_uri: 'https://oauth2.googleapis.com/token',
            auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
            client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${this.credentials.serviceAccountEmail}`
          },
          scopes: [
            'https://www.googleapis.com/auth/meetings.conference.media.readonly',
            'https://www.googleapis.com/auth/meetings.conference.media.audio.readonly',
            'https://www.googleapis.com/auth/meetings.conference.media.video.readonly',
            'https://www.googleapis.com/auth/meetings.space.readonly'
          ]
        });
      } else if (this.credentials.accessToken) {
        // OAuth token authentication
        this.auth.setCredentials({
          access_token: this.credentials.accessToken,
          refresh_token: this.credentials.refreshToken
        });
      }
      
      // Initialize Meet API client
      this.meetAPI = google.meet({ version: 'v1', auth: this.auth });
      
      console.log('✅ Google Meet Media API authentication successful');
      return true;
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      throw error;
    }
  }

  /**
   * Join a Google Meet conference using Meet Media API
   */
  async joinConference(conferenceId) {
    try {
      console.log(`Joining conference: ${conferenceId}`);
      
      this.meetingId = conferenceId;
      
      // Join the conference using Meet Media API
      const joinResponse = await this.meetAPI.conferences.join({
        conferenceId: conferenceId,
        requestBody: {
          // Conference join parameters
          mediaConfig: {
            audio: {
              enabled: true,
              codec: 'OPUS' // Meet Media API supports OPUS
            },
            video: {
              enabled: false // We only need audio for transcription
            }
          }
        }
      });
      
      console.log('Conference join response:', joinResponse.data);
      
      // Start participant tracking
      await this.startParticipantTracking();
      
      // Start audio stream processing
      await this.startAudioStreamProcessing();
      
      this.isConnected = true;
      console.log('✅ Successfully joined conference');
      
      return { success: true, conferenceId: conferenceId };
    } catch (error) {
      console.error('❌ Failed to join conference:', error);
      throw error;
    }
  }

  /**
   * Start participant tracking using Meet Media API
   */
  async startParticipantTracking() {
    try {
      console.log('Starting participant tracking...');
      
      // Get current participants from the conference
      const participantsResponse = await this.meetAPI.conferences.participants.list({
        conferenceId: this.meetingId
      });
      
      console.log('Participants response:', participantsResponse.data);
      
      // Process each participant
      if (participantsResponse.data.participants) {
        participantsResponse.data.participants.forEach(participant => {
        this.handleParticipantJoined(participant);
      });
      }
      
      // Set up real-time participant monitoring
      this.setupParticipantMonitoring();
      
    } catch (error) {
      console.error('Error starting participant tracking:', error);
      throw error;
    }
  }

  /**
   * Set up real-time participant monitoring
   */
  setupParticipantMonitoring() {
    try {
      // Set up polling for participant changes (since real-time events may not be available)
      this.participantPollingInterval = setInterval(async () => {
        try {
          await this.pollParticipantChanges();
        } catch (error) {
          console.error('Error polling participant changes:', error);
        }
      }, 5000); // Poll every 5 seconds
      
    } catch (error) {
      console.error('Error setting up participant monitoring:', error);
    }
  }

  /**
   * Poll for participant changes
   */
  async pollParticipantChanges() {
    try {
      const participantsResponse = await this.meetAPI.conferences.participants.list({
        conferenceId: this.meetingId
      });
      
      if (participantsResponse.data.participants) {
        const currentParticipants = new Set();
        
        participantsResponse.data.participants.forEach(participant => {
          currentParticipants.add(participant.id);
          
          // Check if this is a new participant
          if (!this.participants.has(participant.id)) {
            this.handleParticipantJoined(participant);
          }
        });
        
        // Check for participants who left
        for (const [participantId, participant] of this.participants) {
          if (!currentParticipants.has(participantId)) {
            this.handleParticipantLeft(participantId);
          }
        }
      }
    } catch (error) {
      console.error('Error polling participant changes:', error);
    }
  }

  /**
   * Start audio stream processing using Meet Media API
   */
  async startAudioStreamProcessing() {
    try {
      console.log('Starting audio stream processing...');
      
      // Get audio stream from the conference
      const audioStreamResponse = await this.meetAPI.conferences.getAudioStream({
        conferenceId: this.meetingId,
        requestBody: {
          audioConfig: {
            codec: 'OPUS',
            sampleRate: 48000,
            channels: 1
          }
        }
      });
      
      console.log('Audio stream response:', audioStreamResponse.data);
      
      // Process the audio stream
      if (audioStreamResponse.data.audioStream) {
        this.processAudioStream(audioStreamResponse.data.audioStream);
      }
      
      // Set up continuous audio stream monitoring
      this.setupAudioStreamMonitoring();
      
    } catch (error) {
      console.error('Error starting audio stream processing:', error);
      throw error;
    }
  }

  /**
   * Set up continuous audio stream monitoring
   */
  setupAudioStreamMonitoring() {
    try {
      // Set up polling for audio stream data
      this.audioPollingInterval = setInterval(async () => {
        try {
          await this.pollAudioStream();
        } catch (error) {
          console.error('Error polling audio stream:', error);
        }
      }, 100); // Poll every 100ms for real-time audio
      
    } catch (error) {
      console.error('Error setting up audio stream monitoring:', error);
    }
  }

  /**
   * Poll for audio stream data
   */
  async pollAudioStream() {
    try {
      const audioDataResponse = await this.meetAPI.conferences.getAudioData({
        conferenceId: this.meetingId,
        requestBody: {
          maxResults: 1000 // Get recent audio data
        }
      });
      
      if (audioDataResponse.data.audioData) {
        audioDataResponse.data.audioData.forEach(audioChunk => {
          this.processAudioChunk(audioChunk);
        });
      }
    } catch (error) {
      console.error('Error polling audio stream:', error);
    }
  }

  /**
   * Process audio stream data
   */
  processAudioStream(audioStream) {
    try {
      console.log('Processing audio stream:', audioStream);
      
      // The audio stream contains the WebRTC connection details
      // We need to establish a connection to receive real-time audio data
      this.establishAudioConnection(audioStream);
      
    } catch (error) {
      console.error('Error processing audio stream:', error);
    }
  }

  /**
   * Establish audio connection for real-time data
   */
  establishAudioConnection(audioStream) {
    try {
      // Create WebRTC connection using the provided stream details
      const peerConnection = new RTCPeerConnection({
        iceServers: audioStream.iceServers || []
      });
      
      // Handle incoming audio tracks
      peerConnection.ontrack = (event) => {
        console.log('Received audio track:', event.track);
        
        if (event.track.kind === 'audio') {
          this.handleAudioTrack(event.track);
        }
      };
      
      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('ICE candidate:', event.candidate);
          // Send ICE candidate to Meet Media API
          this.sendIceCandidate(event.candidate);
        }
      };
      
      // Set remote description
      peerConnection.setRemoteDescription(audioStream.offer)
        .then(() => {
          return peerConnection.createAnswer();
        })
        .then(answer => {
          return peerConnection.setLocalDescription(answer);
        })
        .then(() => {
          // Send answer back to Meet Media API
          this.sendAnswer(answer);
        })
        .catch(error => {
          console.error('Error establishing audio connection:', error);
        });
      
    } catch (error) {
      console.error('Error establishing audio connection:', error);
    }
  }

  /**
   * Handle audio track from WebRTC
   */
  handleAudioTrack(audioTrack) {
    try {
      console.log('Handling audio track:', audioTrack);
      
      // Create audio context for processing
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(new MediaStream([audioTrack]));
      
      // Create processor for audio data
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      
      processor.onaudioprocess = (event) => {
        const audioData = event.inputBuffer.getChannelData(0);
        
        // Convert to Int16Array for Deepgram
        const int16Data = new Int16Array(audioData.length);
        for (let i = 0; i < audioData.length; i++) {
          int16Data[i] = Math.max(-32768, Math.min(32767, audioData[i] * 32768));
        }
        
        // Send to audio processing
        this.handleAudioData({
          audioData: int16Data,
          timestamp: Date.now(),
          sampleRate: audioContext.sampleRate
        });
      };
      
      source.connect(processor);
      processor.connect(audioContext.destination);
      
    } catch (error) {
      console.error('Error handling audio track:', error);
    }
  }

  /**
   * Process audio chunk from Meet Media API
   */
  processAudioChunk(audioChunk) {
    try {
      // Extract participant ID and audio data
      const { participantId, audioData, timestamp, csrc } = audioChunk;
      
      // Find participant
      const participant = this.participants.get(participantId);
      
      if (participant) {
        this.handleAudioData({
          participantId: participantId,
          participantName: participant.name,
          audioData: audioData,
          timestamp: timestamp,
          csrc: csrc
        });
      }
      
    } catch (error) {
      console.error('Error processing audio chunk:', error);
    }
  }

  /**
   * Send ICE candidate to Meet Media API
   */
  async sendIceCandidate(candidate) {
    try {
      await this.meetAPI.conferences.sendIceCandidate({
        conferenceId: this.meetingId,
        requestBody: {
          candidate: candidate
        }
      });
    } catch (error) {
      console.error('Error sending ICE candidate:', error);
    }
  }

  /**
   * Send answer to Meet Media API
   */
  async sendAnswer(answer) {
    try {
      await this.meetAPI.conferences.sendAnswer({
        conferenceId: this.meetingId,
        requestBody: {
          answer: answer
        }
      });
    } catch (error) {
      console.error('Error sending answer:', error);
    }
  }

  /**
   * Handle participant joined event
   */
  handleParticipantJoined(participant) {
    console.log('Participant joined:', participant);
    
    const participantData = {
      id: participant.id,
      name: participant.displayName || participant.name || 'Unknown',
      email: participant.email,
      isLocal: participant.isLocal || false,
      joinedAt: new Date(),
      transcript: '',
      isSpeaking: false
    };
    
    this.participants.set(participant.id, participantData);
    
    if (this.onParticipantJoined) {
      this.onParticipantJoined(participantData);
    }
  }

  /**
   * Handle participant left event
   */
  handleParticipantLeft(participantId) {
    console.log('Participant left:', participantId);
    
    const participant = this.participants.get(participantId);
    if (participant) {
      this.participants.delete(participantId);
      
      if (this.onParticipantLeft) {
        this.onParticipantLeft(participant);
      }
    }
  }

  /**
   * Handle audio data from Meet Media API
   */
  handleAudioData(audioData) {
    console.log('Audio data received:', audioData);
    
    // Send to audio processing callback
      if (this.onAudioData) {
      this.onAudioData(audioData);
    }
  }

  /**
   * Get meeting information from Meet Media API
   */
  async getMeetingInfo() {
    try {
      const meetingResponse = await this.meetAPI.conferences.get({
        conferenceId: this.meetingId
      });
      
      return meetingResponse.data;
    } catch (error) {
      console.error('Error getting meeting info:', error);
      return null;
    }
  }

  /**
   * Check if we have real data available
   */
  hasRealData() {
    return this.meetAPI && this.isConnected;
  }

  /**
   * Leave the conference
   */
  async leaveConference() {
    try {
      console.log('Leaving conference...');
      
      // Stop polling intervals
      if (this.participantPollingInterval) {
        clearInterval(this.participantPollingInterval);
      }
      if (this.audioPollingInterval) {
        clearInterval(this.audioPollingInterval);
      }
      
      // Leave the conference
      await this.meetAPI.conferences.leave({
        conferenceId: this.meetingId
      });
      
      this.isConnected = false;
      this.participants.clear();
      this.audioStreams.clear();
      
      console.log('✅ Successfully left conference');
    } catch (error) {
      console.error('Error leaving conference:', error);
      throw error;
    }
  }

  /**
   * Get current participants
   */
  getParticipants() {
    return Array.from(this.participants.values());
  }

  /**
   * Get participant by ID
   */
  getParticipant(id) {
    return this.participants.get(id);
  }
}
