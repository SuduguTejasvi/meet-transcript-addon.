/**
 * Configuration for Google Meet Add-on
 * This file contains non-sensitive configuration values
 */

export const config = {
  // Google Cloud Project Number (get this from Google Cloud Console)
  CLOUD_PROJECT_NUMBER: '409997382473',
  
  // Deepgram API Key (get this from Deepgram dashboard)
  // Set via DEEPGRAM_API_KEY environment variable
  DEEPGRAM_API_KEY: process?.env?.DEEPGRAM_API_KEY || '',
  
  // Attendee.ai API Key (get this from Attendee.dev dashboard)
  // Set via ATTENDEE_API_KEY environment variable
  ATTENDEE_API_KEY: process?.env?.ATTENDEE_API_KEY || '',
  
  // Anthropic/Claude API Key (get this from Anthropic dashboard)
  // Set via ANTHROPIC_API_KEY or CLAUDE_API_KEY environment variable
  ANTHROPIC_API_KEY: process?.env?.ANTHROPIC_API_KEY || process?.env?.CLAUDE_API_KEY || '',
  
  // URLs for your add-on pages
  MAIN_STAGE_URL: window.location.origin + '/mainstage.html',
  SIDE_PANEL_URL: window.location.origin + '/sidepanel.html',
  
  // Environment settings
  NODE_ENV: 'production',
  LOG_LEVEL: 'info'
};

// Override with environment variables if available
if (typeof process !== 'undefined' && process.env) {
  Object.keys(config).forEach(key => {
    if (process.env[key]) {
      config[key] = process.env[key];
    }
  });
}

// Helper function to get configuration value
export function getConfig(key) {
  return config[key];
}

// Helper function to set configuration value
export function setConfig(key, value) {
  config[key] = value;
}

// Helper function to get all configuration
export function getAllConfig() {
  return { ...config };
}
