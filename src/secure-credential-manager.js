/**
 * Secure Credential Manager
 * Handles secure storage and validation of Google Cloud credentials
 * Follows Google's domain-wide delegation best practices
 */

export class SecureCredentialManager {
  constructor() {
    this.credentials = null;
    this.isInitialized = false;
    this.validationErrors = [];
  }

  /**
   * Initialize credentials from environment variables
   */
  async initialize() {
    try {
      console.log('🔐 Initializing secure credential manager...');
      
      // Load environment variables
      await this.loadEnvironmentVariables();
      
      // Validate credentials
      this.validateCredentials();
      
      // Initialize Google Auth if credentials are valid
      if (this.validationErrors.length === 0) {
        await this.initializeGoogleAuth();
        this.isInitialized = true;
        console.log('✅ Secure credential manager initialized successfully');
      } else {
        throw new Error(`Credential validation failed: ${this.validationErrors.join(', ')}`);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize secure credential manager:', error);
      throw error;
    }
  }

  /**
   * Load environment variables securely
   */
  async loadEnvironmentVariables() {
    try {
      // Check if we're in a browser environment
      if (typeof window !== 'undefined') {
        // Browser environment - credentials should be provided via secure means
        console.warn('⚠️ Running in browser environment - credentials should be provided securely');
        return;
      }

      // Node.js environment - load from process.env
      this.credentials = {
        serviceAccountEmail: process.env.SERVICE_ACCOUNT_EMAIL,
        privateKey: process.env.SERVICE_ACCOUNT_PRIVATE_KEY,
        clientId: process.env.CLIENT_ID,
        cloudProjectNumber: process.env.CLOUD_PROJECT_NUMBER,
        deepgramApiKey: process.env.DEEPGRAM_API_KEY,
        mainStageUrl: process.env.MAIN_STAGE_URL,
        sidePanelUrl: process.env.SIDE_PANEL_URL,
        nodeEnv: process.env.NODE_ENV || 'development',
        logLevel: process.env.LOG_LEVEL || 'info'
      };

      console.log('📋 Environment variables loaded');
    } catch (error) {
      console.error('❌ Error loading environment variables:', error);
      throw error;
    }
  }

  /**
   * Validate all required credentials
   */
  validateCredentials() {
    this.validationErrors = [];
    
    const requiredCredentials = [
      { key: 'serviceAccountEmail', name: 'SERVICE_ACCOUNT_EMAIL' },
      { key: 'privateKey', name: 'SERVICE_ACCOUNT_PRIVATE_KEY' },
      { key: 'clientId', name: 'CLIENT_ID' },
      { key: 'cloudProjectNumber', name: 'CLOUD_PROJECT_NUMBER' },
      { key: 'deepgramApiKey', name: 'DEEPGRAM_API_KEY' }
    ];

    // Check for missing credentials
    requiredCredentials.forEach(cred => {
      if (!this.credentials[cred.key] || this.credentials[cred.key] === 'YOUR_PRIVATE_KEY_HERE' || this.credentials[cred.key] === 'YOUR_DEEPGRAM_API_KEY_HERE') {
        this.validationErrors.push(`Missing or placeholder value for ${cred.name}`);
      }
    });

    // Validate private key format
    if (this.credentials.privateKey && !this.credentials.privateKey.includes('BEGIN PRIVATE KEY')) {
      this.validationErrors.push('SERVICE_ACCOUNT_PRIVATE_KEY must be in PEM format');
    }

    // Validate email format
    if (this.credentials.serviceAccountEmail && !this.credentials.serviceAccountEmail.includes('@')) {
      this.validationErrors.push('SERVICE_ACCOUNT_EMAIL must be a valid email address');
    }

    // Validate client ID format
    if (this.credentials.clientId && !this.credentials.clientId.includes('.apps.googleusercontent.com')) {
      this.validationErrors.push('CLIENT_ID must be a valid Google OAuth client ID');
    }

    if (this.validationErrors.length > 0) {
      console.error('❌ Credential validation errors:', this.validationErrors);
    } else {
      console.log('✅ All credentials validated successfully');
    }
  }

  /**
   * Initialize Google Auth Library (browser-compatible)
   */
  async initializeGoogleAuth() {
    try {
      // Browser environment - use Google Meet Add-ons API directly
      if (typeof window !== 'undefined') {
        console.log('✅ Using browser-compatible authentication for Google Meet Add-ons');
        
        // For Google Meet Add-ons, authentication is handled by the platform
        // We don't need to initialize GoogleAuth in the browser
        this.googleAuth = {
          isBrowserMode: true,
          platform: 'google-meet-addons'
        };
        
        console.log('✅ Browser authentication initialized');
      } else {
        console.warn('⚠️ Running in Node.js environment - Google Meet Add-ons require browser environment');
      }
    } catch (error) {
      console.warn('⚠️ Authentication initialization warning:', error.message);
      // This is not critical for the add-on to function
    }
  }

  /**
   * Get credentials securely
   */
  getCredentials() {
    if (!this.isInitialized) {
      throw new Error('Credential manager not initialized. Call initialize() first.');
    }
    
    if (this.validationErrors.length > 0) {
      throw new Error(`Invalid credentials: ${this.validationErrors.join(', ')}`);
    }

    return {
      serviceAccountEmail: this.credentials.serviceAccountEmail,
      privateKey: this.credentials.privateKey,
      clientId: this.credentials.clientId,
      cloudProjectNumber: this.credentials.cloudProjectNumber,
      deepgramApiKey: this.credentials.deepgramApiKey,
      mainStageUrl: this.credentials.mainStageUrl,
      sidePanelUrl: this.credentials.sidePanelUrl,
      nodeEnv: this.credentials.nodeEnv,
      logLevel: this.credentials.logLevel
    };
  }

  /**
   * Get Google Auth client (browser-compatible)
   */
  async getGoogleAuthClient() {
    if (!this.isInitialized) {
      throw new Error('Credential manager not initialized');
    }

    if (this.googleAuth && this.googleAuth.isBrowserMode) {
      // Return a mock client for browser environment
      return {
        isBrowserMode: true,
        platform: 'google-meet-addons',
        getAccessToken: async () => {
          console.log('Using Google Meet Add-ons platform authentication');
          return { token: 'platform-managed' };
        }
      };
    }

    return null;
  }

  /**
   * Check if credentials are valid
   */
  isValid() {
    return this.isInitialized && this.validationErrors.length === 0;
  }

  /**
   * Get validation errors
   */
  getValidationErrors() {
    return this.validationErrors;
  }

  /**
   * Log security status (without exposing sensitive data)
   */
  logSecurityStatus() {
    console.log('🔒 Security Status:');
    console.log(`  - Credential Manager Initialized: ${this.isInitialized}`);
    console.log(`  - Validation Errors: ${this.validationErrors.length}`);
    console.log(`  - Environment: ${this.credentials?.nodeEnv || 'unknown'}`);
    console.log(`  - Log Level: ${this.credentials?.logLevel || 'unknown'}`);
    
    if (this.validationErrors.length > 0) {
      console.log('  - Validation Errors:', this.validationErrors);
    }
  }
}

/**
 * Global credential manager instance
 */
export const credentialManager = new SecureCredentialManager();
