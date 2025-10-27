# Google Meet Live Transcript Add-on

A real-time speech-to-text add-on for Google Meet that captures live audio streams, identifies participants, and provides named transcripts using Deepgram's AI-powered transcription service.

## Features

- 🎤 **Live Audio Capture**: Captures audio streams from Google Meet participants
- 👥 **Participant Identification**: Maps audio streams to participant names using CSRC identifiers
- 📝 **Real-time Transcription**: Converts speech to text using Deepgram's advanced AI models
- 🏷️ **Named Transcripts**: Displays transcripts with speaker names in real-time
- 🎨 **Modern UI**: Beautiful, responsive interface for both side panel and main stage
- 🔄 **Real-time Updates**: Live updates as participants speak

## Architecture

The add-on consists of several key components:

1. **Meet Media API Integration** (`src/meet-media-api.js`)
   - Handles Google Meet participant tracking
   - Maps CSRC identifiers to participant names
   - Simulates audio stream processing

2. **Deepgram Integration** (`src/deepgram-integration.js`)
   - Real-time speech-to-text conversion
   - Speaker diarization for multiple speakers
   - WebSocket-based streaming API

3. **Main Application** (`src/main.js`)
   - Orchestrates the entire transcription process
   - Handles UI updates and user interactions
   - Manages the connection between Meet and Deepgram

4. **User Interface**
   - `sidepanel.html`: Control panel for starting/stopping transcription
   - `mainstage.html`: Main display for live transcripts

## Setup Instructions

### 1. Get Google Cloud Service Account Private Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **IAM & Admin** → **Service Accounts**
3. Find your service account: `service-409997382473@gcp-sa-gsuiteaddons.iam.gserviceaccount.com`
4. Click on it → **Keys** tab → **Add Key** → **Create new key** → **JSON**
5. Download the JSON file and extract the `private_key` field

### 2. Update Configuration

Edit `src/main.js` and replace `YOUR_PRIVATE_KEY_HERE` with your actual private key:

```javascript
const GOOGLE_CLOUD_CREDENTIALS = {
  serviceAccountEmail: 'service-409997382473@gcp-sa-gsuiteaddons.iam.gserviceaccount.com',
  privateKey: '-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n',
  clientId: '409997382473-4dj4ucqs13cmtbt8p57t74elliqa05ch.apps.googleusercontent.com'
};
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Build the Project

```bash
npm run build
```

### 5. Deploy to Web Server

Upload the following files to your web server:
- `dist/bundle.js` (and `dist/bundle.js.map`)
- `sidepanel.html`
- `mainstage.html`
- `addon-manifest.json`

### 6. Install in Google Meet

1. Go to [Google Workspace Marketplace](https://workspace.google.com/marketplace)
2. Upload your `addon-manifest.json`
3. Install the add-on in your Google Workspace domain
4. The add-on will appear in Google Meet sessions

## Usage

### Starting Transcription

1. Join a Google Meet session
2. Click on the add-on icon in the Meet interface
3. Click **"Start Activity"** to open the main transcript view
4. Click **"Start Live Transcript"** to begin transcription
5. Watch as participants' speech is converted to text with their names

### Features

- **Real-time Updates**: Transcripts appear as participants speak
- **Speaker Identification**: Each transcript line shows who spoke
- **Confidence Scores**: See how confident the AI is about each transcription
- **Speaking Indicators**: Visual indicators show who is currently speaking
- **Participant Management**: Automatic detection of participants joining/leaving

## Technical Details

### CSRC Mapping

The add-on uses CSRC (Contributing Source) identifiers from RTP audio packets to map audio streams to participant names:

```javascript
// When participant joins
this.csrcToParticipant.set(participant.csrc, participant.id);

// When audio data arrives
const participantId = this.csrcToParticipant.get(csrc);
const participant = this.participants.get(participantId);
```

### Deepgram Integration

The add-on sends audio data to Deepgram's streaming API with speaker diarization enabled:

```javascript
const wsUrl = `wss://api.deepgram.com/v1/listen?model=nova-2&diarize=true&interim_results=true`;
```

### Browser Compatibility

The implementation is designed to work in browser environments using:
- WebSocket connections for real-time communication
- Web Audio API for audio processing
- Google Meet Add-ons framework for integration

## Testing

Run the test suite to verify everything works:

```bash
# Test individual components
node test-meet-media-api.mjs
node test-integration.mjs

# Test complete integration
node test-complete.mjs
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Ensure your service account private key is correctly formatted
2. **Audio Capture Issues**: Check browser permissions for microphone access
3. **Deepgram Connection**: Verify your Deepgram API key is valid
4. **Participant Detection**: The add-on uses simulation mode for testing

### Debug Mode

Enable debug logging by opening browser developer tools and checking the console for detailed logs.

## API Keys Required

- **Google Cloud Service Account**: For Meet Media API access
- **Deepgram API Key**: For speech-to-text conversion (already included: `306114cbf5e0f315e34cc259af3d16b9fe000992`)

## File Structure

```
├── src/
│   ├── main.js                 # Main application logic
│   ├── meet-media-api.js      # Google Meet integration
│   └── deepgram-integration.js # Deepgram speech-to-text
├── dist/
│   ├── bundle.js              # Built application
│   └── bundle.js.map          # Source map
├── sidepanel.html             # Side panel UI
├── mainstage.html             # Main stage UI
├── addon-manifest.json        # Add-on configuration
├── package.json               # Dependencies
├── webpack.config.cjs         # Build configuration
└── test-*.mjs                # Test files
```

## License

This project is for educational and demonstration purposes. Please ensure you comply with Google Meet's terms of service and Deepgram's usage policies when deploying.
