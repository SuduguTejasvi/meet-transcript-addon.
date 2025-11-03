/**
 * Configuration for Google Meet Add-on
 * This file contains non-sensitive configuration values
 */

export const config = {
  // Google Cloud Project Number (get this from Google Cloud Console)
  CLOUD_PROJECT_NUMBER: '409997382473',
  
  // Deepgram API Key (get this from Deepgram dashboard)
  DEEPGRAM_API_KEY: '306114cbf5e0f315e34cc259af3d16b9fe000992',
  
  // Attendee.ai API Key (get this from Attendee.dev dashboard)
  ATTENDEE_API_KEY: process?.env?.ATTENDEE_API_KEY || 'FMviPsiy3HSqx50aA51S4cFuTx868JBB',
  
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
