import { meet } from '@googleworkspace/meet-addons/meet.addons';
import { DeepgramTranscriber, AudioCapture, TranscriptionManager } from './deepgram-integration.js';
import { MeetMediaAPI } from './meet-media-api.js';
import { AttendeeIntegration } from './attendee-integration.js';
import { GoogleMeetTranscriptAPI } from './google-meet-transcript-api.js';
import { credentialManager } from './secure-credential-manager.js';

// Initialize secure credential manager
let credentials = null;
let cloudProjectNumber = null;
let deepgramApiKey = null;
let attendeeApiKey = null;
let mainStageUrl = null;

let sidePanelClient;
let mainStageClient;
let participants = new Map();
let transcriptContainer;
let isTranscribing = false;
let transcriptionManager = null;
let attendeeIntegration = null;
let googleMeetTranscriptAPI = null;
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
    attendeeApiKey = credentials.attendeeApiKey;
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

    // Start participant tracking (tries Workspace Events via backend first)
    try {
      await meetMediaAPI.startParticipantTracking();
    } catch (err) {
      console.warn('Participant tracking failed to start:', err);
    }
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
 * Initialize Google Meet Transcript API for live transcription
 */
function initializeGoogleMeetTranscriptAPI() {
  console.log('Initializing Google Meet Transcript API...');
  
  try {
    // Create Google Meet Transcript API instance
    googleMeetTranscriptAPI = new GoogleMeetTranscriptAPI(credentials);
    
    // Set up event handlers
    googleMeetTranscriptAPI.onTranscriptUpdate = (entry) => {
      handleGoogleMeetTranscriptUpdate(entry);
    };
    
    googleMeetTranscriptAPI.onError = (error) => {
      console.error('Google Meet Transcript API error:', error);
      showStatus('Transcript API error: ' + error.message, 'error');
    };
    
    console.log('✅ Google Meet Transcript API initialized successfully');
  } catch (error) {
    console.error('Error initializing Google Meet Transcript API:', error);
    showStatus('Error initializing Transcript API: ' + error.message, 'error');
  }
}

/**
 * Handle real-time transcript updates from Google Meet API
 */
function handleGoogleMeetTranscriptUpdate(entry) {
  const { speakerName, transcription } = entry;
  if (!transcription || !transcription.trim()) return;
  const container = document.getElementById('transcript-container');
  if (!container) return;
  const line = document.createElement('div');
  const speaker = speakerName || 'Speaker';
  line.textContent = `${speaker}: ${transcription}`;
  line.style.color = entry.isFinal === false ? '#555' : '#111';
  line.style.fontStyle = entry.isFinal === false ? 'italic' : 'normal';
  container.appendChild(line);
  container.scrollTop = container.scrollHeight;
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
    
    // Set up event listeners first (so sidePanelClient is available)
    const startActivityBtn = document.getElementById('start-activity');
    const startTranscriptBtn = document.getElementById('start-transcript');
    const stopTranscriptBtn = document.getElementById('stop-transcript');
    const oauthAuthorizeBtn = document.getElementById('oauth-authorize-btn');
    
    // Set up OAuth authorize button handler
    if (oauthAuthorizeBtn) {
      oauthAuthorizeBtn.addEventListener('click', async () => {
        await handleOAuthAuthorization();
      });
    }
    
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
    
    // Initialize Google Meet Transcript API after clients are set up
    initializeGoogleMeetTranscriptAPI();
    
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
 * Start transcript functionality using Google Meet API
 */
async function startTranscript() {
  console.log('Starting transcript with Google Meet API...');
  
  try {
    // Check if Google Meet Transcript API is initialized
    if (!googleMeetTranscriptAPI) {
      throw new Error('Google Meet Transcript API not initialized.');
    }
    
    // Update UI
    const startBtn = document.getElementById('start-transcript') || document.getElementById('start-transcript-btn');
    const stopBtn = document.getElementById('stop-transcript') || document.getElementById('stop-transcript-btn');
    const status = document.getElementById('transcript-status');
    const meetingUrlContainer = document.getElementById('meeting-url-input-container');
    const meetingUrlInput = document.getElementById('meeting-url-input');
    
    // Check if user provided space name for realtime audio
    const spaceNameInput = document.getElementById('space-name-input');
    const spaceName = spaceNameInput && spaceNameInput.value ? spaceNameInput.value.trim() : '';
    // Check if we need manual URL entry
    let meetingCodeOrUrl = meetingUrlInput?.value?.trim();
    
    // If no manual URL, try to get from Meet session
    if (!meetingCodeOrUrl) {
      meetingCodeOrUrl = await getMeetingCodeFromSession();
    }
    
    if (!meetingCodeOrUrl) {
      // Show manual input
      if (meetingUrlContainer) {
        meetingUrlContainer.style.display = 'block';
      }
      throw new Error('Could not detect meeting code. Please enter it manually.');
    }
    
    if (startBtn) startBtn.disabled = true;
    if (stopBtn) stopBtn.disabled = false;
    if (status) {
      status.style.display = 'block';
      status.style.background = '#e8f0fe';
      status.style.color = '#1a73e8';
      status.textContent = '🔄 Connecting to Google Meet API and starting transcription...';
    }
    
    // Get access token from Meet session
    let accessToken = await getAccessTokenFromSession();
    
    // If no token, show authentication UI and wait
    if (!accessToken) {
      if (status) {
        status.style.background = '#fff3cd';
        status.style.color = '#856404';
        status.textContent = '⚠️ Authentication required. Please enter your access token.';
      }
      accessToken = await promptForAccessToken();
      
      if (!accessToken) {
        throw new Error('Access token is required to use Google Meet API. Please authenticate.');
      }
    }
    
    // If a valid space name provided, use realtime WebRTC path
    if (spaceName && spaceName.startsWith('spaces/')) {
      const deepgramKey = (credentials && credentials.deepgramApiKey) ? credentials.deepgramApiKey : (window.process && window.process.env && window.process.env.DEEPGRAM_API_KEY) || '';
      await googleMeetTranscriptAPI.startRealtimeAudio(spaceName, accessToken, deepgramKey);
    } else {
      // Otherwise use REST transcript path (requires Developer Preview + APIs)
      await googleMeetTranscriptAPI.startTranscription(meetingCodeOrUrl, accessToken);
    }
    
    // Hide manual input if successful
    if (meetingUrlContainer) meetingUrlContainer.style.display = 'none';
    
    isTranscribing = true;
    
    if (status) {
      status.style.background = '#e8f5e8';
      status.style.color = '#137333';
      status.textContent = '🎤 Live transcription active - receiving transcripts from Google Meet API';
    }
    
    console.log('✅ Transcription started successfully with Google Meet API');
    
  } catch (error) {
    console.error('Error starting transcription:', error);
    showStatus('Error starting transcription: ' + error.message, 'error');
    
    // Show manual input if URL detection failed
    if (error.message.includes('Could not detect') || error.message.includes('meeting code')) {
      const meetingUrlContainer = document.getElementById('meeting-url-input-container');
      if (meetingUrlContainer) {
        meetingUrlContainer.style.display = 'block';
      }
    }
    
    // Reset UI on error
    const startBtn = document.getElementById('start-transcript') || document.getElementById('start-transcript-btn');
    const stopBtn = document.getElementById('stop-transcript') || document.getElementById('stop-transcript-btn');
    const status = document.getElementById('transcript-status');
    
    if (startBtn) startBtn.disabled = false;
    if (stopBtn) stopBtn.disabled = true;
    if (status) {
      status.style.background = '#fce8e6';
      status.style.color = '#d93025';
      status.textContent = '❌ Failed to start transcription: ' + error.message;
    }
  }
}

/**
 * Get meeting code from Meet session
 */
async function getMeetingCodeFromSession() {
  try {
    // Try from sidePanelClient
    if (sidePanelClient) {
      const meetingInfo = await sidePanelClient.getMeetingInfo?.();
      if (meetingInfo?.meetingCode) {
        return meetingInfo.meetingCode;
      }
      if (meetingInfo?.meetingUrl) {
        return meetingInfo.meetingUrl;
      }
    }
    
    // Try from credentials.meetSession
    if (credentials?.meetSession) {
      const meetingInfo = await credentials.meetSession.getMeetingInfo?.();
      if (meetingInfo?.meetingCode) {
        return meetingInfo.meetingCode;
      }
      if (meetingInfo?.meetingUrl) {
        return meetingInfo.meetingUrl;
      }
    }
    
    return null;
  } catch (error) {
    console.warn('Error getting meeting code from session:', error);
    return null;
  }
}

/**
 * Get access token from Meet session using Google Meet Add-ons SDK
 */
async function getAccessTokenFromSession() {
  try {
    console.log('Attempting to get access token from Meet session...');
    
    // Method 1: Try to get from sidePanelClient (Google Meet Add-ons SDK)
    if (sidePanelClient) {
      try {
        // Google Meet Add-ons SDK may provide getAccessToken method
        if (sidePanelClient.getAccessToken) {
          const tokenData = await sidePanelClient.getAccessToken();
          const token = tokenData?.token || tokenData?.accessToken || tokenData;
          if (token && token !== 'platform-managed') {
            console.log('✅ Got access token from sidePanelClient');
            return token;
          }
        }
      } catch (err) {
        console.warn('Error getting token from sidePanelClient:', err);
      }
    }
    
    // Method 2: Try to get from mainStageClient
    if (mainStageClient) {
      try {
        if (mainStageClient.getAccessToken) {
          const tokenData = await mainStageClient.getAccessToken();
          const token = tokenData?.token || tokenData?.accessToken || tokenData;
          if (token && token !== 'platform-managed') {
            console.log('✅ Got access token from mainStageClient');
            return token;
          }
        }
      } catch (err) {
        console.warn('Error getting token from mainStageClient:', err);
      }
    }
    
    // Method 3: Try to get from Meet session
    if (credentials?.meetSession) {
      try {
        // Check if session has getAccessToken method
        if (credentials.meetSession.getAccessToken) {
          const tokenData = await credentials.meetSession.getAccessToken();
          const token = tokenData?.token || tokenData?.accessToken || tokenData;
          if (token && token !== 'platform-managed') {
            console.log('✅ Got access token from meetSession');
            return token;
          }
        }
        
        // Try using the session's token property if available
        if (credentials.meetSession.token) {
          console.log('✅ Got access token from meetSession.token');
          return credentials.meetSession.token;
        }
      } catch (err) {
        console.warn('Error getting token from meetSession:', err);
      }
    }
    
    // Method 4: Check if stored in credentials
    if (credentials?.accessToken) {
      console.log('✅ Using access token from credentials');
      return credentials.accessToken;
    }
    
    // Method 5: Try to use Google Identity Services (OAuth 2.0) - GSI
    if (window.google && window.google.accounts && window.google.accounts.oauth2) {
      try {
        const token = await authorizeWithGoogleOAuth();
        if (token) {
          console.log('✅ Got access token from Google OAuth');
          return token;
        }
      } catch (err) {
        console.warn('Error getting token from Google OAuth:', err);
      }
    }
    
    // If GSI not loaded yet, try to load it and then authenticate
    if (!window.google || !window.google.accounts) {
      console.log('Loading Google Identity Services...');
      await loadGoogleIdentityServices();
      
      // Wait a bit for GSI to initialize
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (window.google && window.google.accounts && window.google.accounts.oauth2) {
        try {
          const token = await authorizeWithGoogleOAuth();
          if (token) {
            console.log('✅ Got access token from Google OAuth');
            return token;
          }
        } catch (err) {
          console.warn('Error getting token from Google OAuth:', err);
        }
      }
    }
    
    // If no token found, show OAuth UI prompt
    console.warn('⚠️ Access token not found. Starting OAuth flow...');
    const token = await promptForOAuthAuthorization();
    return token;
    
  } catch (error) {
    console.error('Error getting access token:', error);
    // Try to prompt for manual entry as last resort
    return await promptForAccessToken();
  }
}

/**
 * Load Google Identity Services script
 */
function loadGoogleIdentityServices() {
  return new Promise((resolve) => {
    if (window.google && window.google.accounts) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log('Google Identity Services loaded');
      resolve();
    };
    script.onerror = () => {
      console.warn('Failed to load Google Identity Services');
      resolve(); // Resolve anyway to continue
    };
    document.head.appendChild(script);
  });
}

/**
 * Handle OAuth authorization from the UI button
 */
async function handleOAuthAuthorization() {
  const oauthAuthorizeBtn = document.getElementById('oauth-authorize-btn');
  const authStatus = document.getElementById('auth-status');
  const clientIdInput = document.getElementById('oauth-client-id');
  
  if (!clientIdInput) {
    showAuthStatus('Error: Client ID input field not found', 'error');
    return;
  }
  
  const clientId = clientIdInput.value.trim();
  if (!clientId) {
    showAuthStatus('Please enter your OAuth Web Client ID', 'error');
    return;
  }
  
  // Save client ID to credentials
  if (credentials) {
    credentials.oauthClientId = clientId;
  }
  
  if (oauthAuthorizeBtn) {
    oauthAuthorizeBtn.disabled = true;
    oauthAuthorizeBtn.textContent = '⏳ Authorizing...';
  }
  
  showAuthStatus('Loading Google Identity Services...', 'info');
  
  try {
    // Load GSI if not already loaded
    await loadGoogleIdentityServices();
    
    // Wait for GSI to initialize
    let retries = 0;
    while ((!window.google || !window.google.accounts || !window.google.accounts.oauth2) && retries < 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      retries++;
    }
    
    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
      throw new Error('Google Identity Services failed to load. Please refresh the page.');
    }
    
    showAuthStatus('Requesting authorization...', 'info');
    
    // Authorize with the client ID from the input
    const token = await authorizeWithGoogleOAuth(clientId);
    
    if (token) {
      showAuthStatus('✅ Authorization successful! Access token acquired.', 'success');
      if (oauthAuthorizeBtn) {
        oauthAuthorizeBtn.textContent = '✅ Authorized';
        oauthAuthorizeBtn.style.background = '#34a853';
      }
      // Store token
      if (credentials) {
        credentials.accessToken = token;
      }
    } else {
      throw new Error('Failed to get access token');
    }
  } catch (error) {
    console.error('OAuth authorization error:', error);
    showAuthStatus('❌ Authorization failed: ' + (error.message || 'Unknown error'), 'error');
    if (oauthAuthorizeBtn) {
      oauthAuthorizeBtn.disabled = false;
      oauthAuthorizeBtn.textContent = '🔐 Authorize';
      oauthAuthorizeBtn.style.background = '#4285f4';
    }
    
    // Show helpful error messages with detailed configuration steps
    if (error.message && error.message.includes('redirect_uri_mismatch')) {
      const instructions = '❌ Error: redirect_uri_mismatch\n\n' +
        'To fix this in Google Cloud Console:\n' +
        '1. Go to APIs & Services → Credentials\n' +
        '2. Click your OAuth 2.0 Client ID\n' +
        '3. Under "Authorized redirect URIs", click "+ Add URI"\n' +
        '4. Add: http://localhost:8081\n' +
        '5. Add: http://127.0.0.1:8081\n' +
        '6. Click "Save"\n' +
        '7. Wait 2-5 minutes, then try again\n\n' +
        'Note: Redirect URIs are required for GSI popup-based OAuth';
      showAuthStatus(instructions, 'error');
    } else if (error.message && error.message.includes('popup_closed')) {
      showAuthStatus('❌ Popup was closed. Please click Authorize again and complete the authorization. Make sure popups are allowed for this site.', 'error');
    } else if (error.message && error.message.includes('access_denied')) {
      showAuthStatus('❌ Authorization denied. Please try again and grant all requested permissions.', 'error');
    }
  }
}

/**
 * Show auth status message
 */
function showAuthStatus(message, type = 'info') {
  const authStatus = document.getElementById('auth-status');
  if (authStatus) {
    // Use innerHTML if message contains line breaks or HTML, otherwise use textContent
    if (message.includes('\n') || message.includes('<')) {
      // Convert line breaks to <br> for better display
      const htmlMessage = message.replace(/\n/g, '<br>');
      authStatus.innerHTML = htmlMessage;
    } else {
      authStatus.textContent = message;
    }
    authStatus.style.display = 'block';
    
    if (type === 'success') {
      authStatus.style.background = '#e8f5e8';
      authStatus.style.color = '#137333';
      authStatus.style.border = '1px solid #34a853';
    } else if (type === 'error') {
      authStatus.style.background = '#fce8e6';
      authStatus.style.color = '#d93025';
      authStatus.style.border = '1px solid #ea4335';
    } else {
      authStatus.style.background = '#e8f0fe';
      authStatus.style.color = '#1a73e8';
      authStatus.style.border = '1px solid #1a73e8';
    }
  }
}

/**
 * Authorize using Google OAuth 2.0 (Google Identity Services)
 */
async function authorizeWithGoogleOAuth(clientIdOverride = null) {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
      reject(new Error('Google Identity Services not available'));
    return;
  }
    
    // Get client ID from parameter, credentials, or input field
    let clientId = clientIdOverride;
    if (!clientId) {
      const clientIdInput = document.getElementById('oauth-client-id');
      if (clientIdInput) {
        clientId = clientIdInput.value.trim();
      }
    }
    if (!clientId) {
      clientId = credentials?.oauthClientId || '409997382473-c9kq9iijvgibd139ngrg8acitiip22vl.apps.googleusercontent.com';
    }
    
    if (!clientId) {
      reject(new Error('OAuth Client ID not configured'));
      return;
    }
    
    const SCOPES = [
      'https://www.googleapis.com/auth/meetings.space.readonly',
      'https://www.googleapis.com/auth/meetings.conference.media.audio.readonly',
      'https://www.googleapis.com/auth/documents.readonly'
    ];
    
    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPES.join(' '),
        callback: (resp) => {
          if (resp && resp.access_token) {
            const token = resp.access_token;
            console.log('✅ OAuth access token acquired');
            // Store token in credentials for future use
            if (credentials) {
              credentials.accessToken = token;
              credentials.oauthClientId = clientId;
            }
            resolve(token);
          } else if (resp && resp.error) {
            reject(new Error(resp.error + (resp.error_description ? ': ' + resp.error_description : '')));
          } else {
            reject(new Error('Failed to get access token from OAuth'));
          }
        },
        error_callback: (err) => {
          console.error('OAuth error:', err);
          const errorMessage = err.message || err.type || 'OAuth authorization failed';
          reject(new Error(errorMessage));
        }
      });
      
      // Request access token (prompts user for consent)
      // For iframe contexts, use 'consent' to ensure proper flow
      // Note: redirect_uri_mismatch means redirect URIs need to be configured in Google Cloud Console
      tokenClient.requestAccessToken({ prompt: 'consent' });
  } catch (error) {
      reject(error);
    }
  });
}

/**
 * Prompt user to authorize via OAuth (shows UI)
 */
async function promptForOAuthAuthorization() {
  return new Promise((resolve) => {
    // Show OAuth UI instead of manual token input
    const authContainer = document.getElementById('auth-token-input-container');
    const authInput = document.getElementById('auth-token-input');
    
    if (authContainer) {
      // Update the UI to show OAuth button instead
      authContainer.innerHTML = `
        <div style="margin-bottom: 10px;">
          <strong style="color: #856404;">🔐 Google OAuth Authorization Required</strong>
        </div>
        <div style="font-size: 12px; color: #856404; margin-bottom: 15px;">
          Click the button below to authorize with Google. This will open a popup to grant permissions.
        </div>
        <button id="oauth-authorize-btn" class="btn btn-success" style="width: 100%; background: #4285f4;">
          🔐 Authorize with Google
        </button>
        <div style="font-size: 11px; color: #856404; margin-top: 10px; text-align: center;">
          Or <a href="#" id="manual-token-link" style="color: #1a73e8;">enter token manually</a>
        </div>
      `;
      authContainer.style.display = 'block';
      
      // Handle OAuth authorize button
      const oauthBtn = document.getElementById('oauth-authorize-btn');
      const manualLink = document.getElementById('manual-token-link');
      
      if (oauthBtn) {
        oauthBtn.addEventListener('click', async () => {
          oauthBtn.disabled = true;
          oauthBtn.textContent = '⏳ Authorizing...';
          
          try {
            // Load GSI if not loaded
            await loadGoogleIdentityServices();
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Try to authorize
            const token = await authorizeWithGoogleOAuth();
            if (token) {
              authContainer.style.display = 'none';
              resolve(token);
            } else {
              throw new Error('Authorization failed');
            }
          } catch (error) {
            console.error('OAuth authorization error:', error);
            oauthBtn.disabled = false;
            oauthBtn.textContent = '🔐 Authorize with Google';
            alert('Authorization failed: ' + (error.message || 'Unknown error'));
            // Fall back to manual entry
            if (manualLink) manualLink.click();
          }
        });
      }
      
      if (manualLink) {
        manualLink.addEventListener('click', (e) => {
          e.preventDefault();
          // Show manual input
          authContainer.innerHTML = `
            <label for="auth-token-input" style="display: block; margin-bottom: 8px; font-size: 14px; color: #856404; font-weight: 500;">
              🔐 Google OAuth Access Token (Manual Entry):
            </label>
            <input type="password" id="auth-token-input" placeholder="Enter your Google OAuth access token..." 
                   style="width: 100%; padding: 8px; border: 1px solid #dadce0; border-radius: 4px; font-size: 13px; margin-bottom: 8px;">
            <div style="font-size: 12px; color: #856404; margin-bottom: 10px;">
              <strong>How to get access token:</strong><br>
              1. Go to <a href="https://console.cloud.google.com/" target="_blank" style="color: #1a73e8;">Google Cloud Console</a><br>
              2. Enable Google Meet API<br>
              3. Create OAuth 2.0 credentials<br>
              4. Use OAuth 2.0 Playground or generate token
            </div>
            <button id="save-auth-token" class="btn btn-success" style="width: 100%;">
              Save Token & Continue
            </button>
          `;
          
          const manualAuthInput = document.getElementById('auth-token-input');
          const manualSaveBtn = document.getElementById('save-auth-token');
          
          if (manualSaveBtn && manualAuthInput) {
            const handleManualSave = () => {
              const token = manualAuthInput.value.trim();
              if (token) {
                if (credentials) {
                  credentials.accessToken = token;
                }
                authContainer.style.display = 'none';
                resolve(token);
              } else {
                alert('Please enter a valid access token');
              }
            };
            
            manualSaveBtn.addEventListener('click', handleManualSave);
            manualAuthInput.addEventListener('keypress', (e) => {
              if (e.key === 'Enter') handleManualSave();
            });
            manualAuthInput.focus();
          }
        });
      }
    } else {
      // Fallback to browser prompt if UI doesn't exist
      const message = 'Google Meet API requires OAuth authorization.\n\nEnter your Google OAuth access token:';
      try {
        const token = prompt(message);
        if (token && token.trim()) {
          if (credentials) {
            credentials.accessToken = token.trim();
          }
          resolve(token.trim());
        } else {
          resolve(null);
        }
      } catch (err) {
        resolve(null);
      }
    }
  });
}

/**
 * Prompt user to enter access token manually via UI (deprecated - use OAuth instead)
 */
async function promptForAccessToken() {
  // Redirect to OAuth flow
  return await promptForOAuthAuthorization();
}

/**
 * Stop transcript functionality
 */
async function stopTranscript() {
  console.log('Stopping transcript...');
  
  try {
    // Stop Google Meet transcript API
    if (googleMeetTranscriptAPI && isTranscribing) {
      await googleMeetTranscriptAPI.stopTranscription();
    }
    
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
    const tc = document.getElementById('transcript-container');
    if (tc) tc.innerHTML = '';
    
    console.log('✅ Transcription stopped successfully');
    
  } catch (error) {
    console.error('Error stopping transcription:', error);
    showStatus('Error stopping transcription: ' + error.message, 'error');
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
