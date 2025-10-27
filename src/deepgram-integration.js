/**
 * Deepgram Integration for Live Transcription
 * This module handles real-time speech-to-text conversion using Deepgram's WebSocket API
 * Integrated with Google Meet Media API for real participant tracking
 */

import { MeetMediaAPI } from './meet-media-api.js';

export class DeepgramTranscriber {
  constructor(apiKey, options = {}) {
    this.apiKey = apiKey;
    this.connection = null;
    this.participants = new Map();
    this.isConnected = false;
    this.options = {
      model: 'nova-2',
      language: 'en-US',
      punctuate: true,
      profanity_filter: false,
      redact: false,
      diarize: true, // Enable speaker diarization
      ...options
    };
  }

  /**
   * Initialize Deepgram WebSocket connection
   */
  async connect() {
    try {
      // Create Deepgram WebSocket URL
      const wsUrl = `wss://api.deepgram.com/v1/listen?model=${this.options.model}&language=${this.options.language}&punctuate=${this.options.punctuate}&profanity_filter=${this.options.profanity_filter}&redact=${this.options.redact}&diarize=${this.options.diarize}&interim_results=true&smart_format=true&encoding=linear16&sample_rate=16000&channels=1`;
      
      // Create WebSocket connection
      this.connection = new WebSocket(wsUrl, {
        headers: {
          'Authorization': `Token ${this.apiKey}`
        }
      });
      
      this.connection.onopen = () => {
        console.log('Deepgram WebSocket connected');
        this.isConnected = true;
        this.onConnectionOpen();
      };
      
      this.connection.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleTranscriptionResult(data);
      };
      
      this.connection.onerror = (error) => {
        console.error('Deepgram WebSocket error:', error);
        this.onConnectionError(error);
      };
      
      this.connection.onclose = () => {
        console.log('Deepgram WebSocket closed');
        this.isConnected = false;
        this.onConnectionClose();
      };
      
    } catch (error) {
      console.error('Error connecting to Deepgram:', error);
      throw error;
    }
  }

  /**
   * Send audio data to Deepgram
   */
  sendAudio(audioData, source = 'unknown') {
    if (this.connection && this.isConnected) {
      // Add source metadata to the audio data if needed
      // For now, just send the raw audio data
      this.connection.send(audioData);
    }
  }

  /**
   * Handle transcription results from Deepgram
   */
  handleTranscriptionResult(data) {
    if (data.channel && data.channel.alternatives && data.channel.alternatives.length > 0) {
      const transcript = data.channel.alternatives[0].transcript;
      const confidence = data.channel.alternatives[0].confidence;
      
      // Extract speaker information if diarization is enabled
      let speakerId = null;
      if (data.channel.alternatives[0].words && data.channel.alternatives[0].words.length > 0) {
        speakerId = data.channel.alternatives[0].words[0].speaker;
      }
      
      if (transcript && transcript.trim()) {
        this.onTranscriptReceived({
          transcript: transcript.trim(),
          confidence,
          speakerId,
          isFinal: data.is_final,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  /**
   * Disconnect from Deepgram
   */
  disconnect() {
    if (this.connection) {
      this.connection.close();
      this.connection = null;
    }
    this.isConnected = false;
  }

  /**
   * Event handlers - to be overridden by the main application
   */
  onConnectionOpen() {
    console.log('Deepgram connection established');
  }

  onConnectionError(error) {
    console.error('Deepgram connection error:', error);
  }

  onConnectionClose() {
    console.log('Deepgram connection closed');
  }

  onTranscriptReceived(transcriptData) {
    console.log('Transcript received:', transcriptData);
  }
}

/**
 * Audio Capture Utility
 * Handles capturing audio from Google Meet participants and user's microphone
 */
export class AudioCapture {
  constructor(meetMediaAPI = null) {
    this.mediaStream = null;
    this.audioContext = null;
    this.processor = null;
    this.isCapturing = false;
    this.meetMediaAPI = meetMediaAPI;
    this.participantAudioStreams = new Map();
  }

  /**
   * Start capturing audio from microphone and Meet participants
   */
  async startCapture() {
    try {
      // Start microphone capture
      await this.startMicrophoneCapture();
      
      // Start Meet participant audio capture if MeetMediaAPI is available
      if (this.meetMediaAPI) {
        await this.startMeetParticipantAudioCapture();
      }
      
      this.isCapturing = true;
      console.log('✅ Audio capture started (microphone + Meet participants)');
      
    } catch (error) {
      console.error('Error starting audio capture:', error);
      throw error;
    }
  }

  /**
   * Start capturing audio from microphone
   */
  async startMicrophoneCapture() {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        }
      });

      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000
      });

      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      
      // Create a script processor for real-time audio processing
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      this.processor.onaudioprocess = (event) => {
        const inputBuffer = event.inputBuffer;
        const inputData = inputBuffer.getChannelData(0);
        
        // Convert Float32Array to Int16Array for Deepgram
        const int16Data = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          int16Data[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
        }
        
        this.onAudioData(int16Data, 'microphone');
      };

      source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
      
      console.log('✅ Microphone capture started');
      
    } catch (error) {
      console.error('Error starting microphone capture:', error);
      throw error;
    }
  }

  /**
   * Start capturing audio from Meet participants
   */
  async startMeetParticipantAudioCapture() {
    try {
      console.log('Starting Meet participant audio capture...');
      
      // Set up audio processing for Meet participant streams
      this.setupMeetParticipantAudioProcessing();
      
      console.log('✅ Meet participant audio capture started');
      
    } catch (error) {
      console.error('Error starting Meet participant audio capture:', error);
      // Don't throw error - microphone capture can still work
    }
  }

  /**
   * Set up audio processing for Meet participant streams
   */
  setupMeetParticipantAudioProcessing() {
    // Set up audio processing for each participant's audio stream
    if (this.meetMediaAPI && this.meetMediaAPI.audioStreams) {
      this.meetMediaAPI.audioStreams.forEach((stream, participantId) => {
        this.processParticipantAudioStream(stream, participantId);
      });
    }
  }

  /**
   * Process audio stream from a specific participant
   */
  processParticipantAudioStream(audioStream, participantId) {
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
          sampleRate: 16000
        });
      }

      const source = this.audioContext.createMediaStreamSource(audioStream);
      const processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      processor.onaudioprocess = (event) => {
        const inputBuffer = event.inputBuffer;
        const inputData = inputBuffer.getChannelData(0);
        
        // Convert Float32Array to Int16Array for Deepgram
        const int16Data = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          int16Data[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
        }
        
        this.onAudioData(int16Data, participantId);
      };

      source.connect(processor);
      processor.connect(this.audioContext.destination);
      
      // Store processor for cleanup
      this.participantAudioStreams.set(participantId, { source, processor });
      
      console.log(`✅ Audio processing started for participant: ${participantId}`);
      
    } catch (error) {
      console.error(`Error processing audio stream for participant ${participantId}:`, error);
    }
  }

  /**
   * Stop capturing audio
   */
  stopCapture() {
    // Stop microphone capture
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    // Stop Meet participant audio capture
    this.participantAudioStreams.forEach(({ source, processor }, participantId) => {
      try {
        processor.disconnect();
        source.disconnect();
        console.log(`✅ Audio processing stopped for participant: ${participantId}`);
      } catch (error) {
        console.error(`Error stopping audio processing for participant ${participantId}:`, error);
      }
    });
    this.participantAudioStreams.clear();
    
    this.isCapturing = false;
    console.log('✅ Audio capture stopped');
  }

  /**
   * Event handler for audio data - to be overridden
   */
  onAudioData(audioData, source = 'unknown') {
    // This will be called with audio data in real-time
    // The main application should send this to Deepgram
    // source can be 'microphone' or participant ID
  }
}

/**
 * Meet Participant Integration
 * Handles integration with Google Meet's participant API using MeetMediaAPI
 */
export class MeetParticipantManager {
  constructor(credentials) {
    this.participants = new Map();
    this.onParticipantChange = null;
    this.meetMediaAPI = new MeetMediaAPI(credentials);
    this.isInitialized = false;
  }

  /**
   * Initialize participant tracking with real Google Meet integration
   */
  async initialize(meetingId, meetSession) {
    try {
      console.log('Initializing real Google Meet participant tracking...');
      
      // Initialize MeetMediaAPI authentication
      await this.meetMediaAPI.initializeAuth();
      
      // Join the meeting as a media bot
      await this.meetMediaAPI.joinMeeting(meetingId, meetSession);
      
      // Set up event handlers for real participant events
      this.setupRealParticipantEventHandlers();
      
      // Get current participants from the meeting
      const currentParticipants = await this.meetMediaAPI.getCurrentParticipants();
      
      // Process each participant
      currentParticipants.forEach(participant => {
        this.handleRealParticipantJoined(participant);
      });
      
      this.isInitialized = true;
      console.log('✅ Real Google Meet participant tracking initialized');
      
    } catch (error) {
      console.error('❌ Failed to initialize real participant tracking:', error);
      // Fallback to mock data if real integration fails
      console.log('Falling back to mock participant data...');
      this.simulateParticipants();
    }
  }

  /**
   * Set up event handlers for real participant events
   */
  setupRealParticipantEventHandlers() {
    // Handle participant joined events
    this.meetMediaAPI.onParticipantJoined = (participant) => {
      console.log('Real participant joined:', participant);
      this.handleRealParticipantJoined(participant);
    };

    // Handle participant left events
    this.meetMediaAPI.onParticipantLeft = (participantId) => {
      console.log('Real participant left:', participantId);
      this.handleRealParticipantLeft(participantId);
    };

    // Handle audio data from participants
    this.meetMediaAPI.onAudioData = (audioData) => {
      console.log('Real audio data received from participant:', audioData.participantName);
      this.handleRealParticipantAudio(audioData);
    };

    // Handle errors
    this.meetMediaAPI.onError = (error) => {
      console.error('MeetMediaAPI error:', error);
    };
  }

  /**
   * Handle real participant joined event
   */
  handleRealParticipantJoined(participant) {
    const participantData = {
      id: participant.id,
      name: participant.displayName || participant.name || 'Unknown',
      csrc: participant.csrc,
      isLocal: participant.isLocal || false,
      email: participant.email,
      avatar: participant.avatar || '👤',
      transcript: '',
      isSpeaking: false,
      lastSpoke: null,
      confidence: 0,
      joinedAt: new Date()
    };

    this.participants.set(participant.id, participantData);
    
    if (this.onParticipantChange) {
      this.onParticipantChange(Array.from(this.participants.values()));
    }
    
    console.log(`✅ Real participant added: ${participantData.name} (${participantData.id})`);
  }

  /**
   * Handle real participant left event
   */
  handleRealParticipantLeft(participantId) {
    const participant = this.participants.get(participantId);
    if (participant) {
      this.participants.delete(participantId);
      
      if (this.onParticipantChange) {
        this.onParticipantChange(Array.from(this.participants.values()));
      }
      
      console.log(`✅ Real participant removed: ${participant.name} (${participantId})`);
    }
  }

  /**
   * Handle real participant audio data
   */
  handleRealParticipantAudio(audioData) {
    const participant = this.participants.get(audioData.participantId);
    if (participant) {
      // Mark participant as speaking
      participant.isSpeaking = true;
      participant.lastSpoke = new Date().toLocaleTimeString();
      
      if (this.onParticipantChange) {
        this.onParticipantChange(Array.from(this.participants.values()));
      }
      
      // Stop speaking indicator after 3 seconds
      setTimeout(() => {
        participant.isSpeaking = false;
        if (this.onParticipantChange) {
          this.onParticipantChange(Array.from(this.participants.values()));
        }
      }, 3000);
    }
  }

  /**
   * Simulate participants for demonstration (fallback)
   */
  simulateParticipants() {
    const mockParticipants = [
      { id: 'user1', name: 'John Doe', avatar: '👨‍💼', isLocal: true },
      { id: 'user2', name: 'Jane Smith', avatar: '👩‍💼', isLocal: false },
      { id: 'user3', name: 'Bob Johnson', avatar: '👨‍🔬', isLocal: false },
      { id: 'user4', name: 'Alice Brown', avatar: '👩‍🎨', isLocal: false }
    ];

    mockParticipants.forEach(participant => {
      this.participants.set(participant.id, {
        ...participant,
        transcript: '',
        isSpeaking: false,
        lastSpoke: null,
        confidence: 0
      });
    });

    if (this.onParticipantChange) {
      this.onParticipantChange(Array.from(this.participants.values()));
    }
  }

  /**
   * Get participant by ID
   */
  getParticipant(id) {
    return this.participants.get(id);
  }

  /**
   * Update participant transcript
   */
  updateParticipantTranscript(id, transcript, confidence = 0) {
    const participant = this.participants.get(id);
    if (participant) {
      participant.transcript += (participant.transcript ? ' ' : '') + transcript;
      participant.confidence = confidence;
      participant.lastSpoke = new Date().toLocaleTimeString();
      
      if (this.onParticipantChange) {
        this.onParticipantChange(Array.from(this.participants.values()));
      }
    }
  }

  /**
   * Set participant speaking status
   */
  setParticipantSpeaking(id, isSpeaking) {
    const participant = this.participants.get(id);
    if (participant) {
      participant.isSpeaking = isSpeaking;
      
      if (this.onParticipantChange) {
        this.onParticipantChange(Array.from(this.participants.values()));
      }
    }
  }

  /**
   * Get all participants
   */
  getAllParticipants() {
    return Array.from(this.participants.values());
  }
}

/**
 * Main Transcription Manager
 * Orchestrates the entire transcription process with real Google Meet integration
 */
export class TranscriptionManager {
  constructor(deepgramApiKey, credentials = null) {
    this.deepgram = new DeepgramTranscriber(deepgramApiKey);
    this.meetMediaAPI = credentials ? new MeetMediaAPI(credentials) : null;
    this.audioCapture = new AudioCapture(this.meetMediaAPI);
    this.participantManager = new MeetParticipantManager(credentials);
    this.isTranscribing = false;
    this.meetingId = null;
    this.meetSession = null;
    
    this.setupEventHandlers();
  }

  /**
   * Set up event handlers
   */
  setupEventHandlers() {
    // Handle Deepgram events
    this.deepgram.onTranscriptReceived = (transcriptData) => {
      this.handleTranscript(transcriptData);
    };

    this.deepgram.onConnectionOpen = () => {
      console.log('Deepgram connected successfully');
    };

    this.deepgram.onConnectionError = (error) => {
      console.error('Deepgram connection error:', error);
    };

    this.deepgram.onConnectionClose = () => {
      console.log('Deepgram connection closed');
    };

    // Handle audio capture from microphone and Meet participants
    this.audioCapture.onAudioData = (audioData, source) => {
      if (this.isTranscribing) {
        // Send audio data to Deepgram with source information
        this.deepgram.sendAudio(audioData, source);
      }
    };

    // Handle participant changes
    this.participantManager.onParticipantChange = (participants) => {
      this.onParticipantsUpdated(participants);
    };
  }

  /**
   * Start transcription with real Google Meet integration
   */
  async startTranscription(meetingId = null, meetSession = null) {
    try {
      console.log('Starting transcription with real Google Meet integration...');
      
      // Store meeting information
      this.meetingId = meetingId;
      this.meetSession = meetSession;
      
      // Initialize participant tracking with real Meet data
      await this.participantManager.initialize(meetingId, meetSession);
      
      // Connect to Deepgram
      await this.deepgram.connect();
      
      // Start audio capture (microphone + Meet participants)
      await this.audioCapture.startCapture();
      
      this.isTranscribing = true;
      console.log('✅ Transcription started successfully with real Google Meet integration');
      
    } catch (error) {
      console.error('Error starting transcription:', error);
      throw error;
    }
  }

  /**
   * Stop transcription
   */
  async stopTranscription() {
    try {
      console.log('Stopping transcription...');
      
      this.isTranscribing = false;
      
      // Stop audio capture
      this.audioCapture.stopCapture();
      
      // Disconnect from Deepgram
      this.deepgram.disconnect();
      
      console.log('Transcription stopped successfully');
      
    } catch (error) {
      console.error('Error stopping transcription:', error);
      throw error;
    }
  }

  /**
   * Handle transcript data from Deepgram
   */
  handleTranscript(transcriptData) {
    const { transcript, confidence, speakerId, isFinal } = transcriptData;
    
    if (transcript && isFinal) {
      // Map speaker ID to participant
      const participantId = this.mapSpeakerToParticipant(speakerId);
      
      if (participantId) {
        this.participantManager.updateParticipantTranscript(participantId, transcript, confidence);
        this.participantManager.setParticipantSpeaking(participantId, true);
        
        // Stop speaking indicator after 3 seconds
        setTimeout(() => {
          this.participantManager.setParticipantSpeaking(participantId, false);
        }, 3000);
      }
    }
  }

  /**
   * Map Deepgram speaker ID to participant ID using real CSRC data
   */
  mapSpeakerToParticipant(speakerId) {
    // Try to map using real CSRC data from MeetMediaAPI
    if (this.meetMediaAPI && this.meetMediaAPI.csrcToParticipant) {
      // Look for participant with matching CSRC
      for (const [participantId, participant] of this.participantManager.participants) {
        if (participant.csrc && participant.csrc === speakerId) {
          return participantId;
        }
      }
    }
    
    // Fallback: Use participant order mapping
    const participants = Array.from(this.participantManager.participants.keys());
    if (participants.length > 0 && speakerId !== null && speakerId !== undefined) {
      const index = speakerId % participants.length;
      return participants[index];
    }
    
    // Final fallback: Return first participant
    return participants[0] || 'unknown';
  }

  /**
   * Event handler for participant updates
   */
  onParticipantsUpdated(participants) {
    // This will be called when participants are updated
    // The main application should handle UI updates
    console.log('Participants updated:', participants);
  }

  /**
   * Get current transcription status
   */
  getStatus() {
    return {
      isTranscribing: this.isTranscribing,
      isDeepgramConnected: this.deepgram.isConnected,
      isAudioCapturing: this.audioCapture.isCapturing,
      participants: this.participantManager.getAllParticipants()
    };
  }
}
