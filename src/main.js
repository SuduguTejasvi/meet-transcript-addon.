import { meet } from '@googleworkspace/meet-addons/meet.addons';
import { DeepgramTranscriber, AudioCapture, TranscriptionManager } from './deepgram-integration.js';
import { MeetMediaAPI } from './meet-media-api.js';
import { credentialManager } from './secure-credential-manager.js';

// Initialize secure credential manager
let credentials = null;
let cloudProjectNumber = null;
let deepgramApiKey = null;
let mainStageUrl = null;

let sidePanelClient;
let mainStageClient;
let participants = new Map();
let transcriptContainer;
let isTranscribing = false;
let transcriptionManager = null;
let meetMediaAPI = null;

/**
 * Initialize secure credentials
 */
async function initializeSecureCredentials() {
  try {
    console.log('🔐 Initializing secure credentials...');
    
    // Initialize credential manager
    await credentialManager.initialize();
    
    // Get validated credentials
    credentials = credentialManager.getCredentials();
    cloudProjectNumber = credentials.cloudProjectNumber;
    deepgramApiKey = credentials.deepgramApiKey;
    mainStageUrl = credentials.mainStageUrl;
    
    // Log security status (without exposing sensitive data)
    credentialManager.logSecurityStatus();
    
    console.log('✅ Secure credentials initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize secure credentials:', error);
    
    // Log validation errors for debugging
    const validationErrors = credentialManager.getValidationErrors();
    if (validationErrors.length > 0) {
      console.error('Validation errors:', validationErrors);
      console.error('Please check your configuration and ensure all required credentials are set.');
    }
    
    throw error;
  }
}

/**
 * Initialize Meet Media API
 */
async function initializeMeetMediaAPI(meetSession = null) {
  try {
    console.log('Initializing Meet Media API...');
    
    // Ensure credentials are initialized
    if (!credentials) {
      throw new Error('Credentials not initialized. Call initializeSecureCredentials() first.');
    }
    
    // Add Meet session to credentials for real API access
    if (meetSession) {
      credentials.meetSession = meetSession;
      console.log('✅ Meet session added to credentials for real API access');
    }
    
    meetMediaAPI = new MeetMediaAPI(credentials);
    
    // Set up event handlers
    meetMediaAPI.onParticipantJoined = (participant) => {
      console.log('Participant joined:', participant);
      participants.set(participant.id, participant);
      updateParticipantDisplay();
    };
    
    meetMediaAPI.onParticipantLeft = (participant) => {
      console.log('Participant left:', participant);
      participants.delete(participant.id);
      updateParticipantDisplay();
    };
    
    meetMediaAPI.onAudioData = (audioData) => {
      handleMeetAudioData(audioData);
    };
    
    meetMediaAPI.onError = (error) => {
      console.error('Meet Media API error:', error);
      showStatus('Meet Media API error: ' + error.message, 'error');
    };
    
    // Initialize authentication
    await meetMediaAPI.initializeAuth();
    
    console.log('✅ Meet Media API initialized successfully');
    console.log('📋 Note: This implementation uses the official Google Meet Media API');
    console.log('📋 Requirements: Google Meet REST API must be enabled and Developer Preview enrollment');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Meet Media API:', error);
    showStatus('Failed to initialize Meet Media API: ' + error.message, 'error');
    return false;
  }
}

/**
 * Handle audio data from Meet Media API
 */
function handleMeetAudioData(audioData) {
  const { participantId, participantName, audioData: rawAudio, timestamp } = audioData;
  
  console.log(`Audio from ${participantName} (${participantId})`);
  
  // Send audio to Deepgram for transcription
  if (transcriptionManager && transcriptionManager.isTranscribing) {
    // Create a speaker-specific audio stream
    const speakerAudioData = {
      participantId: participantId,
      participantName: participantName,
      audioData: rawAudio,
      timestamp: timestamp
    };
    
    // Send to Deepgram with speaker identification
    sendAudioToDeepgram(speakerAudioData);
  }
}

/**
 * Send audio data to Deepgram with speaker identification
 */
function sendAudioToDeepgram(speakerAudioData) {
  if (transcriptionManager && transcriptionManager.deepgram.isConnected) {
    // Send audio data to Deepgram
    transcriptionManager.deepgram.sendAudio(speakerAudioData.audioData);
    
    // Store speaker context for when transcript comes back
    transcriptionManager.currentSpeaker = {
      id: speakerAudioData.participantId,
      name: speakerAudioData.participantName,
      timestamp: speakerAudioData.timestamp
    };
  }
}

/**
 * Initialize Deepgram client for real-time transcription
 */
function initializeDeepgram() {
  console.log('Initializing Deepgram client...');
  
  try {
    // Ensure credentials are initialized
    if (!deepgramApiKey) {
      throw new Error('Deepgram API key not initialized. Call initializeSecureCredentials() first.');
    }
    
    // Create transcription manager with Deepgram API key
    transcriptionManager = new TranscriptionManager(deepgramApiKey, credentials);
    
    // Override the transcript handler to include speaker information
    transcriptionManager.deepgram.onTranscriptReceived = (transcriptData) => {
      handleTranscriptUpdate(transcriptData);
    };
    
    console.log('Deepgram client initialized successfully');
  } catch (error) {
    console.error('Error initializing Deepgram:', error);
    showStatus('Error initializing Deepgram: ' + error.message, 'error');
  }
}

/**
 * Handle real-time transcript updates from Deepgram
 */
function handleTranscriptUpdate(transcriptData) {
  const { transcript, confidence, speakerId, isFinal } = transcriptData;
  
  if (transcript && isFinal) {
    // Use current speaker context from Meet Media API
    const currentSpeaker = transcriptionManager.currentSpeaker;
    
    if (currentSpeaker) {
      const participant = participants.get(currentSpeaker.id);
      
      if (participant) {
        // Add new transcript with speaker name
        participant.transcript += (participant.transcript ? ' ' : '') + transcript;
        participant.isSpeaking = true;
        participant.lastSpoke = new Date().toLocaleTimeString();
        participant.confidence = confidence;
        
        updateParticipantDisplay();
        
        // Stop speaking indicator after 3 seconds
        setTimeout(() => {
          participant.isSpeaking = false;
          updateParticipantDisplay();
        }, 3000);
        
        console.log(`${currentSpeaker.name}: ${transcript}`);
      }
    }
  }
}

/**
 * Set up the add-on side panel
 */
export async function setUpAddon() {
  try {
    // Initialize secure credentials first
    await initializeSecureCredentials();
    
    const session = await meet.addon.createAddonSession({
      cloudProjectNumber: cloudProjectNumber,
    });
    
    sidePanelClient = await session.createSidePanelClient();
    
    // Initialize Meet Media API with the Meet session
    const mediaAPIReady = await initializeMeetMediaAPI(session);
    if (!mediaAPIReady) {
      throw new Error('Failed to initialize Meet Media API');
    }
    
    // Initialize Deepgram
    initializeDeepgram();
    
    // Set up event listeners
    const startActivityBtn = document.getElementById('start-activity');
    const startTranscriptBtn = document.getElementById('start-transcript');
    const stopTranscriptBtn = document.getElementById('stop-transcript');
    
    if (startActivityBtn) {
      startActivityBtn.addEventListener('click', async () => {
        try {
          await sidePanelClient.startActivity({
            mainStageUrl: mainStageUrl
          });
          showStatus('Activity started successfully!', 'success');
        } catch (error) {
          console.error('Error starting activity:', error);
          showStatus('Error starting activity: ' + error.message, 'error');
        }
      });
    }
    
    if (startTranscriptBtn) {
      startTranscriptBtn.addEventListener('click', startTranscript);
    }
    
    if (stopTranscriptBtn) {
      stopTranscriptBtn.addEventListener('click', stopTranscript);
    }
    
    console.log('Add-on initialized successfully');
    showStatus('Add-on loaded successfully!', 'success');
  } catch (error) {
    console.error('Error setting up add-on:', error);
    showStatus('Error initializing add-on: ' + error.message, 'error');
  }
}

/**
 * Initialize main stage
 */
export async function initializeMainStage() {
  try {
    // Ensure credentials are initialized
    if (!credentials) {
      await initializeSecureCredentials();
    }
    
    const session = await meet.addon.createAddonSession({
      cloudProjectNumber: cloudProjectNumber,
    });
    
    mainStageClient = await session.createMainStageClient();
    
    // Ensure MeetMediaAPI has access to the session
    if (meetMediaAPI && credentials) {
      credentials.meetSession = session;
      console.log('✅ Meet session updated for main stage');
    }
    
    // Create transcript UI
    createTranscriptUI();
    
    // Join the current meeting as a media bot
    await joinCurrentMeeting();
    
    console.log('Main stage initialized successfully');
  } catch (error) {
    console.error('Error initializing main stage:', error);
  }
}

/**
 * Join the current meeting as a media bot
 */
async function joinCurrentMeeting() {
  try {
    console.log('Joining current meeting as media bot...');
    
    if (!meetMediaAPI) {
      throw new Error('Meet Media API not initialized');
    }
    
    // Get current meeting ID from the Meet session
    const meetingId = await getCurrentMeetingId();
    
    if (meetingId) {
      // Join the conference using Meet Media API
      await meetMediaAPI.joinConference(meetingId);
      console.log('✅ Successfully joined conference using Meet Media API');
    } else {
      console.log('No active meeting found, using fallback mode');
      console.log('📋 Note: Conference ID is required for Meet Media API access');
    }
  } catch (error) {
    console.error('Error joining meeting:', error);
    showStatus('Error joining meeting: ' + error.message, 'error');
  }
}

/**
 * Get current meeting ID
 */
async function getCurrentMeetingId() {
  try {
    // Try to get the meeting ID from the main stage client
    if (mainStageClient && mainStageClient.getMeetingInfo) {
      const meetingInfo = await mainStageClient.getMeetingInfo();
      return meetingInfo?.meetingId || meetingInfo?.id;
    }
    
    // Try to get from the side panel client
    if (sidePanelClient && sidePanelClient.getMeetingInfo) {
      const meetingInfo = await sidePanelClient.getMeetingInfo();
      return meetingInfo?.meetingId || meetingInfo?.id;
    }
    
    // Try to extract from URL or other sources
    const urlParams = new URLSearchParams(window.location.search);
    const meetingId = urlParams.get('meetingId') || urlParams.get('id');
    if (meetingId) {
      return meetingId;
    }
    
    // Try to get from Google Meet's internal state
    if (window.meet && window.meet.getMeetingId) {
      return await window.meet.getMeetingId();
    }
    
    return null;
  } catch (error) {
    console.error('Error getting meeting ID:', error);
    return null;
  }
}

/**
 * Create the transcript UI
 */
function createTranscriptUI() {
  const container = document.createElement('div');
  container.id = 'transcript-container';
  container.style.cssText = `
    width: 100%;
    height: 100vh;
    padding: 20px;
    font-family: 'Google Sans', Arial, sans-serif;
    background: #f8f9fa;
    box-sizing: border-box;
  `;
  
  const header = document.createElement('div');
  header.style.cssText = `
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  `;
  
  header.innerHTML = `
    <h1 style="color: #1a73e8; margin: 0 0 20px 0; font-size: 28px;">🎤 Live Transcript</h1>
    <div style="display: flex; gap: 10px; margin-bottom: 10px;">
      <button id="start-transcript-btn" style="
        padding: 12px 24px; 
        background: #34a853; 
        color: white; 
        border: none; 
        border-radius: 6px; 
        cursor: pointer;
        font-size: 16px;
        font-weight: 500;
        transition: background-color 0.2s;
      ">Start Live Transcript</button>
      <button id="stop-transcript-btn" style="
        padding: 12px 24px; 
        background: #ea4335; 
        color: white; 
        border: none; 
        border-radius: 6px; 
        cursor: pointer;
        font-size: 16px;
        font-weight: 500;
        transition: background-color 0.2s;
        opacity: 0.6;
        cursor: not-allowed;
      " disabled>Stop Transcript</button>
    </div>
    <div id="transcript-status" style="
      padding: 10px;
      border-radius: 4px;
      font-size: 14px;
      background: #e8f0fe;
      color: #1a73e8;
      display: none;
    ">Ready to start transcription</div>
  `;
  
  const transcriptArea = document.createElement('div');
  transcriptArea.id = 'transcript-area';
  transcriptArea.style.cssText = `
    background: white;
    border: 1px solid #dadce0;
    border-radius: 8px;
    padding: 20px;
    height: calc(100vh - 200px);
    overflow-y: auto;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  `;
  
  container.appendChild(header);
  container.appendChild(transcriptArea);
  document.body.appendChild(container);
  
  transcriptContainer = transcriptArea;
  
  // Add event listeners for buttons
  document.getElementById('start-transcript-btn')?.addEventListener('click', startTranscript);
  document.getElementById('stop-transcript-btn')?.addEventListener('click', stopTranscript);
}

/**
 * Update participant display
 */
function updateParticipantDisplay() {
  if (!transcriptContainer) return;
  
  transcriptContainer.innerHTML = '';
  
  if (participants.size === 0) {
    transcriptContainer.innerHTML = `
      <div style="
        text-align: center; 
        color: #5f6368; 
        padding: 40px;
        font-size: 16px;
      ">
        No participants detected. Waiting for participants to join...
      </div>
    `;
    return;
  }
  
  participants.forEach((participant, id) => {
    const participantDiv = document.createElement('div');
    participantDiv.style.cssText = `
      margin-bottom: 20px;
      padding: 20px;
      border: 2px solid ${participant.isSpeaking ? '#1a73e8' : '#e0e0e0'};
      border-radius: 12px;
      background: ${participant.isSpeaking ? '#e8f0fe' : '#ffffff'};
      transition: all 0.3s ease;
      position: relative;
    `;
    
    const speakingIndicator = participant.isSpeaking ? `
      <div style="
        position: absolute;
        top: 10px;
        right: 15px;
        background: #1a73e8;
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
        animation: pulse 1s infinite;
      ">🎤 Speaking</div>
    ` : '';
    
    participantDiv.innerHTML = `
      ${speakingIndicator}
      <div style="
        display: flex;
        align-items: center;
        margin-bottom: 15px;
        font-weight: 600;
        color: #1a73e8;
        font-size: 18px;
      ">
        <span style="font-size: 24px; margin-right: 10px;">${participant.isLocal ? '👤' : '👥'}</span>
        ${participant.name}
      </div>
      <div style="
        color: #5f6368;
        line-height: 1.6;
        font-size: 16px;
        min-height: 24px;
      ">
        ${participant.transcript || '<span style="color: #9aa0a6; font-style: italic;">No transcript yet...</span>'}
      </div>
      ${participant.lastSpoke ? `
        <div style="
          color: #9aa0a6;
          font-size: 12px;
          margin-top: 10px;
          text-align: right;
        ">
          Last spoke: ${participant.lastSpoke}
        </div>
      ` : ''}
    `;
    
    transcriptContainer.appendChild(participantDiv);
  });
  
  // Add CSS for pulse animation
  if (!document.getElementById('transcript-styles')) {
    const style = document.createElement('style');
    style.id = 'transcript-styles';
    style.textContent = `
      @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * Start transcript functionality
 */
async function startTranscript() {
  console.log('Starting transcript...');
  
  try {
    // Update UI
    const startBtn = document.getElementById('start-transcript-btn');
    const stopBtn = document.getElementById('stop-transcript-btn');
    const status = document.getElementById('transcript-status');
    
    if (startBtn) startBtn.disabled = true;
    if (stopBtn) stopBtn.disabled = false;
    if (status) {
      status.style.display = 'block';
      status.style.background = '#e8f5e8';
      status.style.color = '#137333';
      status.textContent = '🎤 Live transcription active - listening to all participants';
    }
    
    // Start Deepgram transcription
    await startDeepgramConnection();
    
    isTranscribing = true;
    console.log('Transcription started successfully');
    
  } catch (error) {
    console.error('Error starting transcription:', error);
    showStatus('Error starting transcription: ' + error.message, 'error');
    
    // Reset UI on error
    const startBtn = document.getElementById('start-transcript-btn');
    const stopBtn = document.getElementById('stop-transcript-btn');
    if (startBtn) startBtn.disabled = false;
    if (stopBtn) stopBtn.disabled = true;
  }
}

/**
 * Stop transcript functionality
 */
async function stopTranscript() {
  console.log('Stopping transcript...');
  
  try {
    // Stop Deepgram transcription
    await stopDeepgramConnection();
    
    isTranscribing = false;
    
    // Update UI
    const startBtn = document.getElementById('start-transcript-btn');
    const stopBtn = document.getElementById('stop-transcript-btn');
    const status = document.getElementById('transcript-status');
    
    if (startBtn) startBtn.disabled = false;
    if (stopBtn) stopBtn.disabled = true;
    if (status) {
      status.style.background = '#fce8e6';
      status.style.color = '#d93025';
      status.textContent = '⏹️ Transcription stopped';
    }
    
    console.log('Transcription stopped successfully');
    
  } catch (error) {
    console.error('Error stopping transcription:', error);
    showStatus('Error stopping transcription: ' + error.message, 'error');
  }
}

/**
 * Start Deepgram connection
 */
async function startDeepgramConnection() {
  console.log('Starting Deepgram connection...');
  
  if (!transcriptionManager) {
    throw new Error('Transcription manager not initialized');
  }
  
  try {
    await transcriptionManager.startTranscription();
    console.log('Deepgram connection started successfully');
  } catch (error) {
    console.error('Error starting Deepgram connection:', error);
    throw error;
  }
}

/**
 * Stop Deepgram connection
 */
async function stopDeepgramConnection() {
  console.log('Stopping Deepgram connection...');
  
  if (!transcriptionManager) {
    console.warn('Transcription manager not initialized');
    return;
  }
  
  try {
    await transcriptionManager.stopTranscription();
    console.log('Deepgram connection stopped successfully');
  } catch (error) {
    console.error('Error stopping Deepgram connection:', error);
    throw error;
  }
}

/**
 * Show status message in side panel
 */
function showStatus(message, type = 'info') {
  const statusElement = document.getElementById('status');
  if (statusElement) {
    statusElement.textContent = message;
    statusElement.className = `status ${type}`;
    statusElement.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      statusElement.style.display = 'none';
    }, 5000);
  }
}

// Note: Initialization is now handled explicitly in the HTML files
// This ensures proper function calling as per Google Meet add-ons documentation
