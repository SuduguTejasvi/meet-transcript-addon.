# Google Meet Live Transcript Add-on

A Google Meet add-on that provides real-time transcription for all meeting participants using Deepgram's speech-to-text API. Each participant's speech is transcribed and displayed with their name in real-time.

## Features

- 🎤 **Real-time Transcription**: Live speech-to-text conversion using Deepgram's WebSocket API
- 👥 **Speaker Identification**: Each transcript is labeled with the speaker's name using Deepgram's diarization
- 🎯 **Visual Indicators**: Shows who is currently speaking with visual cues
- 📱 **Side Panel Control**: Start/stop transcript from the side panel
- 🖥️ **Main Stage Display**: Full-screen transcript view for all participants
- 🔧 **Deepgram Integration**: Professional-grade speech-to-text accuracy with real-time processing
- 🎨 **Modern UI**: Clean, responsive interface with Google Material Design
- 🎙️ **Audio Capture**: Real microphone input processing with noise suppression
- 🔄 **Live Updates**: Real-time transcript updates as participants speak

## Prerequisites

Before setting up the add-on, you'll need:

1. **Google Cloud Project** with the following APIs enabled:
   - Google Workspace Marketplace SDK
   - Google Workspace add-ons API

2. **Deepgram Account** with API key:
   - Sign up at [Deepgram](https://deepgram.com)
   - Get your API key from the dashboard

3. **Web Hosting** for deployment:
   - GitHub Pages, Firebase Hosting, Netlify, or Vercel

## Installation & Setup

### 1. Install Dependencies

```bash
cd "/home/tejs/Downloads/Meet Add on"
npm install
```

### 2. Configure Environment Variables

Update the following values in `src/main.js`:

```javascript
const CLOUD_PROJECT_NUMBER = 'YOUR_GOOGLE_CLOUD_PROJECT_NUMBER';
const MAIN_STAGE_URL = 'YOUR_DEPLOYED_MAIN_STAGE_URL';
const DEEPGRAM_API_KEY = 'YOUR_DEEPGRAM_API_KEY';
```

### 3. Build the Project

```bash
npm run build
```

This will create a `dist/bundle.js` file with all the compiled code.

### 4. Deploy to Web Hosting

Deploy the following files to your web hosting service:

- `sidepanel.html`
- `mainstage.html`
- `dist/bundle.js`
- Any logo images you want to use

### 5. Update Manifest

Update `addon-manifest.json` with your actual URLs:

```json
{
  "addOns": {
    "common": {
      "name": "Live Transcript",
      "logoUrl": "https://your-domain.com/logo.png"
    },
    "meet": {
      "web": {
        "sidePanelUrl": "https://your-domain.com/sidepanel.html",
        "supportsScreenSharing": true,
        "addOnOrigins": ["https://your-domain.com"],
        "logoUrl": "https://your-domain.com/meet-logo.png",
        "darkModeLogoUrl": "https://your-domain.com/meet-logo-dark.png"
      }
    }
  }
}
```

### 6. Deploy the Add-on

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** > **Google Workspace Marketplace SDK**
3. Click **HTTP deployments** tab
4. Click **Create new deployment**
5. Enter a deployment ID (e.g., "live-transcript-v1")
6. Paste your manifest JSON in the deployment specification
7. Click **Submit**

### 7. Install and Test

1. In the Google Workspace Marketplace SDK, click **Install** under your deployment
2. Go to [meet.google.com](https://meet.google.com)
3. Start a meeting
4. Click the **Activities** button (puzzle piece icon)
5. Select your "Live Transcript" add-on
6. Click **Launch Transcript in Main Stage** from the side panel
7. Click **Start Live Transcript** to begin transcription

## Development

### Local Development

```bash
npm run dev
```

This will start webpack in watch mode, automatically rebuilding when you make changes.

### Project Structure

```
├── src/
│   ├── main.js                 # Main application logic
│   └── deepgram-integration.js # Deepgram WebSocket integration
├── sidepanel.html              # Side panel interface
├── mainstage.html              # Main stage interface
├── package.json                # Dependencies and scripts
├── webpack.config.js          # Webpack configuration
├── addon-manifest.json         # Add-on manifest for deployment
└── README.md                   # This file
```

### Key Components

- **Side Panel**: Control interface for starting/stopping transcription
- **Main Stage**: Full-screen transcript display for all participants
- **Deepgram Integration**: Real-time WebSocket connection for speech-to-text
- **Participant Management**: Tracks and displays transcripts by speaker
- **Audio Capture**: Handles microphone input and audio processing

## Configuration Options

### Deepgram Settings

You can customize the Deepgram transcription settings in `src/deepgram-integration.js`:

```javascript
const options = {
  model: 'nova-2',           // Deepgram model
  language: 'en-US',         // Language code
  punctuate: true,           // Add punctuation
  profanity_filter: false,   // Filter profanity
  redact: false,             // Redact sensitive info
  diarize: true              // Enable speaker diarization
};
```

### UI Customization

The UI can be customized by modifying the CSS in the HTML files or adding custom styles to `src/main.js`.

## Troubleshooting

### Common Issues

1. **"Missing required Meet SDK URL parameter"**
   - This is expected when running locally
   - The error disappears when running within Meet

2. **Deepgram connection fails**
   - Verify your API key is correct
   - Check that your domain is whitelisted in Deepgram settings

3. **Audio not being captured**
   - Ensure microphone permissions are granted
   - Check browser compatibility (Chrome/Edge recommended)

4. **Add-on not appearing in Meet**
   - Verify the manifest URLs are correct
   - Ensure the add-on is properly installed
   - Check that all required APIs are enabled

### Debug Mode

Enable debug logging by opening browser DevTools and checking the console for detailed logs.

## Security Considerations

- Store API keys securely (consider using environment variables)
- Implement proper CORS headers for your domain
- Use HTTPS for all deployments
- Regularly rotate API keys

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
- Check the troubleshooting section above
- Review Google Meet Add-ons documentation
- Consult Deepgram API documentation
- Open an issue in the repository

## Roadmap

- [ ] Real participant detection (currently uses mock data)
- [ ] Export transcripts functionality
- [ ] Multiple language support
- [ ] Custom speaker names
- [ ] Transcript search and filtering
- [ ] Integration with Google Drive for transcript storage

