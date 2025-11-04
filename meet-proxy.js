// Minimal proxy to call Google Meet Media API from server to avoid browser CORS

import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
// Using Node 18+ built-in fetch (no need for node-fetch)

const app = express();
const PORT = process.env.PORT || 8787;
const ALLOWED_ORIGINS = [
  'http://localhost:8081',
  'http://127.0.0.1:8081',
  'http://localhost:8000',
  'http://127.0.0.1:8000',
  // Allow GitHub Pages origin for production sidepanel hosting
  'https://sudugutejasvi.github.io',
];

// Webhook secret from environment variable (get from Attendee dashboard)
const ATTENDEE_WEBHOOK_SECRET = process.env.ATTENDEE_WEBHOOK_SECRET || 'w6qpnfZZDIyPO2zqGwC4wuAJlzaJUBELncyjfu/RauI=';

// In-memory storage for webhook transcripts (keyed by bot_id)
const webhookTranscripts = new Map();

// Helper function to sort object keys recursively
function sortKeys(value) {
  if (Array.isArray(value)) {
    return value.map(sortKeys);
  }
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.keys(value)
      .sort()
      .reduce((acc, k) => ({ ...acc, [k]: sortKeys(value[k]) }), {});
  }
  return value;
}

// Helper function to verify webhook signature
function verifyWebhookSignature(payload, signature, secret) {
  if (!secret || !signature) {
    console.warn('[Webhook] No secret or signature provided, skipping verification');
    return true; // Allow if no secret configured (for development)
  }
  
  try {
    // Convert payload to canonical JSON string (sorted keys)
    const canonical = JSON.stringify(sortKeys(payload));
    const secretBuf = Buffer.from(secret, 'base64');
    const calculatedSignature = crypto
      .createHmac('sha256', secretBuf)
      .update(canonical, 'utf8')
      .digest('base64');
    
    return calculatedSignature === signature;
  } catch (err) {
    console.error('[Webhook] Error verifying signature:', err);
    return false;
  }
}

// Log basic server start info and CORS config
console.log('[Proxy] CORS allowed origins:', ALLOWED_ORIGINS);

app.use(cors({
  origin: ALLOWED_ORIGINS,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'X-Access-Token', 'x-access-token',
    'X-Project-Number', 'x-project-number',
    'x-claude-key', 'X-CLAUDE-KEY'
  ],
}));

// Ensure OPTIONS preflight responses include CORS headers
// NOTE: cors() middleware above responds to preflight automatically; no explicit app.options route
app.use(express.json());

// Root route - helpful message
app.get('/', (req, res) => {
  console.log('[Proxy] GET / from origin:', req.headers.origin || 'unknown');
  res.json({
    message: 'Meet API Proxy Server',
    info: 'This proxy forwards requests to Google Meet API to avoid CORS issues.',
    usage: 'Use the HTML test page at http://localhost:8081/meet-media-audio-test.html',
    endpoints: {
      health: '/health',
      lookupSpace: '/api/lookupSpace?meetingCode=XXX',
      connectConference: '/api/connectActiveConference',
      conferenceRecords: '/api/conferenceRecords?spaceName=spaces/XXX',
      transcripts: '/api/transcripts?conferenceRecord=conferenceRecords/XXX',
      transcriptEntries: '/api/transcripts/entries?transcript=...',
      transcriptEntry: '/api/transcripts/entry?name=...'
    }
  });
});

// Lookup a space resource name from a meeting code
app.get('/api/lookupSpace', async (req, res) => {
  try {
    const accessToken = req.get('x-access-token');
    const meetingCode = (req.query.meetingCode || '').toString().trim();
    console.log('[Proxy] /api/lookupSpace', { origin: req.headers.origin, meetingCode, hasToken: !!accessToken });
    // Do not force quota project; the working test page does not set it
    if (!accessToken) return res.status(401).json({ error: 'missing_access_token' });
    if (!meetingCode) return res.status(400).json({ error: 'missing_meeting_code' });

    // Prefer JSON responses for better error messages
    const headers = { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' };
    
    // Try v2beta first (this is what the working test flow uses), then v2
    const v2betaUrl = `https://meet.googleapis.com/v2beta/spaces:lookup?meetingCode=${encodeURIComponent(meetingCode)}`;
    console.log('[Proxy] lookup v2beta →', v2betaUrl);
    let upstream = await fetch(v2betaUrl , { headers });
    let body = await upstream.text();
    const isHtml = body && body.trim().startsWith('<');
    console.log('[Proxy] lookup v2beta status:', upstream.status, 'isHtml:', isHtml, 'bodyPreview:', body.substring(0,200));
    if (upstream.status === 404 || isHtml) {
      // Retry with v2
      const v2Url = `https://meet.googleapis.com/v2/spaces:lookup?meetingCode=${encodeURIComponent(meetingCode)}`;
      console.log('[Proxy] lookup v2 fallback →', v2Url);
      const retryResp = await fetch(v2Url , { headers });
      const retryBody = await retryResp.text();
      console.log('[Proxy] lookup v2 status:', retryResp.status, 'isHtml:', retryBody.trim().startsWith('<'), 'bodyPreview:', retryBody.substring(0,200));
      if (retryResp.ok) {
        upstream = retryResp;
        body = retryBody;
      } else if (retryResp.status !== 404 || !isHtml) {
        // Use retry response if it provides a better error than generic HTML
        upstream = retryResp;
        body = retryBody;
      }
    }

    const text = body;
    res.status(upstream.status);
    try {
      res.type('application/json').send(JSON.stringify(JSON.parse(text)));
    } catch (_) {
      console.log('[Proxy] lookup non-JSON body, sending as text');
      res.type('text/plain').send(text);
    }
  } catch (err) {
    console.error('[Proxy] /api/lookupSpace error:', err && err.message ? err.message : err);
    res.status(500).json({ error: 'proxy_error', message: err && err.message ? err.message : String(err) });
  }
});

// Get a specific transcript entry by full resource name
// name format: conferenceRecords/{confRecord}/transcripts/{transcript}/entries/{entry}
app.get('/api/transcripts/entry', async (req, res) => {
  try {
    const accessToken = req.get('x-access-token');
    const name = (req.query.name || '').toString().trim();
    console.log('[Proxy] /api/transcripts/entry', { name, hasToken: !!accessToken });
    if (!accessToken) return res.status(401).json({ error: 'missing_access_token' });
    if (!name) return res.status(400).json({ error: 'missing_name' });

    const url = `https://meet.googleapis.com/v2/${encodeURI(name)}`;
    console.log('[Proxy] fetching entry →', url);
    const upstream = await fetch(url, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    const text = await upstream.text();
    res.status(upstream.status);
    try {
      res.type('application/json').send(JSON.stringify(JSON.parse(text)));
    } catch (_) {
      res.type('text/plain').send(text);
    }
  } catch (err) {
    console.error('[Proxy] /api/transcripts/entry error:', err && err.message ? err.message : err);
    res.status(500).json({ error: 'proxy_error', message: err && err.message ? err.message : String(err) });
  }
});

// List conference records for a space
// Query: spaceName=spaces/AAAA-BBBB-CCC
app.get('/api/conferenceRecords', async (req, res) => {
  try {
    const accessToken = req.get('x-access-token');
    const spaceName = (req.query.spaceName || '').toString().trim();
    console.log('[Proxy] /api/conferenceRecords', { spaceName, hasToken: !!accessToken });
    if (!accessToken) return res.status(401).json({ error: 'missing_access_token' });
    if (!spaceName) return res.status(400).json({ error: 'missing_space_name' });

    const url = `https://meet.googleapis.com/v2beta/${encodeURI(spaceName)}/conferenceRecords`;
    console.log(`[Proxy] Fetching conference records: ${url}`);
    const upstream = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    const text = await upstream.text();
    console.log(`[Proxy] Response status: ${upstream.status}, body preview: ${text.substring(0, 200)}`);
    res.status(upstream.status);
    // Include response headers for debugging
    if (!upstream.ok) {
      console.log(`[Proxy] Error response headers:`, Object.fromEntries(upstream.headers.entries()));
    }
    try { res.type('application/json').send(JSON.stringify(JSON.parse(text))); }
    catch (_) { res.type('text/plain').send(text); }
  } catch (err) {
    console.error('[Proxy] /api/conferenceRecords error:', err && err.message ? err.message : err);
    res.status(500).json({ error: 'proxy_error', message: err && err.message ? err.message : String(err) });
  }
});

// List transcripts under a conference record
// Query: conferenceRecord=conferenceRecords/ID
app.get('/api/transcripts', async (req, res) => {
  try {
    const accessToken = req.get('x-access-token');
    const conferenceRecord = (req.query.conferenceRecord || '').toString().trim();
    console.log('[Proxy] /api/transcripts', { conferenceRecord, hasToken: !!accessToken });
    if (!accessToken) return res.status(401).json({ error: 'missing_access_token' });
    if (!conferenceRecord) return res.status(400).json({ error: 'missing_conference_record' });

    const url = `https://meet.googleapis.com/v2beta/${encodeURI(conferenceRecord)}/transcripts`;
    console.log('[Proxy] fetching transcripts →', url);
    const upstream = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    const text = await upstream.text();
    res.status(upstream.status);
    try { res.type('application/json').send(JSON.stringify(JSON.parse(text))); }
    catch (_) { res.type('text/plain').send(text); }
  } catch (err) {
    console.error('[Proxy] /api/transcripts error:', err && err.message ? err.message : err);
    res.status(500).json({ error: 'proxy_error', message: err && err.message ? err.message : String(err) });
  }
});

// List entries under a transcript
// Query: transcript=conferenceRecords/ID/transcripts/ID
app.get('/api/transcripts/entries', async (req, res) => {
  try {
    const accessToken = req.get('x-access-token');
    const transcript = (req.query.transcript || '').toString().trim();
    console.log('[Proxy] /api/transcripts/entries', { transcript, hasToken: !!accessToken });
    if (!accessToken) return res.status(401).json({ error: 'missing_access_token' });
    if (!transcript) return res.status(400).json({ error: 'missing_transcript' });

    const url = `https://meet.googleapis.com/v2beta/${encodeURI(transcript)}/entries`;
    console.log('[Proxy] fetching entries →', url);
    const upstream = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    const text = await upstream.text();
    res.status(upstream.status);
    try { res.type('application/json').send(JSON.stringify(JSON.parse(text))); }
    catch (_) { res.type('text/plain').send(text); }
  } catch (err) {
    console.error('[Proxy] /api/transcripts/entries error:', err && err.message ? err.message : err);
    res.status(500).json({ error: 'proxy_error', message: err && err.message ? err.message : String(err) });
  }
});

app.post('/api/connectActiveConference', async (req, res) => {
  try {
    const accessToken = req.get('x-access-token');
    const { spaceName, offer } = req.body || {};
    console.log('[Proxy] /api/connectActiveConference', { spaceName, hasOffer: !!offer, hasToken: !!accessToken });

    if (!accessToken) {
      return res.status(401).json({ error: 'missing_access_token' });
    }
    if (!spaceName || !offer) {
      return res.status(400).json({ error: 'missing_parameters' });
    }

    // Do NOT URL-encode the slash in the resource name; the API expects
    // /v2beta/spaces/{spaceId}:connectActiveConference
    const normalizedName = decodeURIComponent(spaceName);
    const url = `https://meet.googleapis.com/v2beta/${normalizedName}:connectActiveConference`;

    console.log('[Proxy] connectActiveConference →', url);
    const upstream = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ offer }),
    });

    const text = await upstream.text();
    res.status(upstream.status);
    // Try JSON, fall back to text
    try {
      res.type('application/json').send(JSON.stringify(JSON.parse(text)));
    } catch (_) {
      res.type('text/plain').send(text);
    }
  } catch (err) {
    console.error('[Proxy] /api/connectActiveConference error:', err && err.message ? err.message : err);
    res.status(500).json({ error: 'proxy_error', message: err && err.message ? err.message : String(err) });
  }
});

// Verify space name by checking if it exists
app.get('/api/verifySpace', async (req, res) => {
  try {
    const accessToken = req.get('x-access-token');
    const spaceName = (req.query.spaceName || '').toString().trim();
    console.log('[Proxy] /api/verifySpace', { spaceName, hasToken: !!accessToken });
    if (!accessToken) return res.status(401).json({ error: 'missing_access_token' });
    if (!spaceName) return res.status(400).json({ error: 'missing_space_name' });

    // Try to get space info to verify it exists
    const url = `https://meet.googleapis.com/v2beta/${encodeURI(spaceName)}`;
    console.log('[Proxy] verifySpace →', url);
    const upstream = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    const text = await upstream.text();
    res.status(upstream.status);
    try {
      res.type('application/json').send(JSON.stringify(JSON.parse(text)));
    } catch (_) {
      res.type('text/plain').send(text);
    }
  } catch (err) {
    console.error('[Proxy] /api/verifySpace error:', err && err.message ? err.message : err);
    res.status(500).json({ error: 'proxy_error', message: err && err.message ? err.message : String(err) });
  }
});

// Fetch transcript from Google Docs by document ID
// Requires Google Docs API scope
app.get('/api/docs/transcript', async (req, res) => {
  try {
    const accessToken = req.get('x-access-token');
    const documentId = (req.query.documentId || '').toString().trim();
    console.log('[Proxy] /api/docs/transcript', { documentId, hasToken: !!accessToken });
    if (!accessToken) return res.status(401).json({ error: 'missing_access_token' });
    if (!documentId) return res.status(400).json({ error: 'missing_document_id' });

    // Use Google Docs API to get document content
    const url = `https://docs.googleapis.com/v1/documents/${encodeURIComponent(documentId)}`;
    console.log('[Proxy] docs transcript →', url);
    const upstream = await fetch(url, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    const text = await upstream.text();
    res.status(upstream.status);
    try {
      res.type('application/json').send(JSON.stringify(JSON.parse(text)));
    } catch (_) {
      res.type('text/plain').send(text);
    }
  } catch (err) {
    console.error('[Proxy] /api/docs/transcript error:', err && err.message ? err.message : err);
    res.status(500).json({ error: 'proxy_error', message: err && err.message ? err.message : String(err) });
  }
});

app.get('/health', (_req, res) => res.json({ ok: true }));

// Proxy to Anthropic Claude to avoid browser CORS
app.post('/api/askClaude', async (req, res) => {
  try {
    const claudeKey = req.get('x-claude-key');
    const { prompt, model, max_tokens } = req.body || {};
    if (!claudeKey) return res.status(401).json({ error: 'missing_api_key' });
    if (!prompt) return res.status(400).json({ error: 'missing_prompt' });
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': claudeKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model || 'claude-3-5-sonnet-20240620',
        max_tokens: max_tokens || 512,
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });
    const text = await upstream.text();
    res.status(upstream.status);
    try {
      const json = JSON.parse(text);
      const answer = (json && json.content && json.content[0] && json.content[0].text) || text;
      res.type('application/json').send(JSON.stringify({ answer, raw: json }));
    } catch (_) {
      res.type('application/json').send(JSON.stringify({ answer: text }));
    }
  } catch (err) {
    res.status(500).json({ error: 'proxy_error', message: err && err.message ? err.message : String(err) });
  }
});

// Webhook endpoint for Attendee.ai transcript updates
app.post('/api/webhooks/attendee', async (req, res) => {
  try {
    const payload = req.body;
    const signature = req.header('X-Webhook-Signature') || '';
    
    console.log('[Webhook] Received Attendee webhook:', {
      trigger: payload?.trigger,
      botId: payload?.bot_id,
      timestamp: new Date().toISOString()
    });
    
    // Verify webhook signature
    if (!verifyWebhookSignature(payload, signature, ATTENDEE_WEBHOOK_SECRET)) {
      console.error('[Webhook] Invalid signature');
      return res.status(400).json({ error: 'invalid_signature' });
    }
    
    // Handle different webhook triggers
    const trigger = payload?.trigger;
    const botId = payload?.bot_id;
    const data = payload?.data || {};
    
    if (trigger === 'transcript.update') {
      // Handle transcript update
      const transcriptEntry = {
        speakerName: data.speaker_name || 'Unknown',
        speakerUuid: data.speaker_uuid || null,
        speakerUserUuid: data.speaker_user_uuid || null,
        speakerIsHost: data.speaker_is_host || false,
        timestamp: data.timestamp_ms || 0,
        duration: data.duration_ms || 0,
        transcription: data.transcription?.transcript || data.transcription || '',
        words: data.transcription?.words || null,
        botId: botId,
        receivedAt: Date.now()
      };
      
      console.log('[Webhook] Transcript update:', {
        speaker: transcriptEntry.speakerName,
        text: transcriptEntry.transcription.substring(0, 50) + '...',
        timestamp: transcriptEntry.timestamp
      });
      
      // Store transcript entry by bot ID
      if (!webhookTranscripts.has(botId)) {
        webhookTranscripts.set(botId, []);
      }
      const transcripts = webhookTranscripts.get(botId);
      transcripts.push(transcriptEntry);
      
      // Keep only last 1000 entries per bot to prevent memory issues
      if (transcripts.length > 1000) {
        transcripts.shift();
      }
      
    } else if (trigger === 'bot.state_change') {
      // Handle bot state change
      console.log('[Webhook] Bot state change:', {
        botId: botId,
        oldState: data.old_state,
        newState: data.new_state,
        eventType: data.event_type
      });
      
      // Store bot state
      if (!webhookTranscripts.has(botId)) {
        webhookTranscripts.set(botId, []);
      }
      const transcripts = webhookTranscripts.get(botId);
      transcripts.push({
        type: 'bot_state_change',
        oldState: data.old_state,
        newState: data.new_state,
        eventType: data.event_type,
        timestamp: data.created_at || Date.now(),
        botId: botId,
        receivedAt: Date.now()
      });
    }
    
    // Always return 200 OK to acknowledge receipt
    res.status(200).json({ received: true, timestamp: new Date().toISOString() });
    
  } catch (err) {
    console.error('[Webhook] Error processing webhook:', err);
    res.status(500).json({ error: 'webhook_error', message: err.message });
  }
});

// Get webhook transcripts for a bot (polling endpoint for frontend)
app.get('/api/webhooks/attendee/transcripts/:botId', (req, res) => {
  try {
    const botId = req.params.botId;
    const since = parseInt(req.query.since) || 0; // Get entries after this timestamp
    
    const transcripts = webhookTranscripts.get(botId) || [];
    
    // Filter transcripts received after 'since' timestamp
    const newTranscripts = transcripts.filter(t => t.receivedAt > since);
    
    res.json({
      botId: botId,
      transcripts: newTranscripts,
      total: transcripts.length,
      latestTimestamp: transcripts.length > 0 ? transcripts[transcripts.length - 1].receivedAt : 0
    });
  } catch (err) {
    console.error('[Webhook] Error getting transcripts:', err);
    res.status(500).json({ error: 'error', message: err.message });
  }
});

// Clear transcripts for a bot
app.delete('/api/webhooks/attendee/transcripts/:botId', (req, res) => {
  try {
    const botId = req.params.botId;
    webhookTranscripts.delete(botId);
    res.json({ success: true, message: 'Transcripts cleared' });
  } catch (err) {
    console.error('[Webhook] Error clearing transcripts:', err);
    res.status(500).json({ error: 'error', message: err.message });
  }
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Meet proxy listening on http://localhost:${PORT}`);
  if (ATTENDEE_WEBHOOK_SECRET) {
    console.log('[Webhook] Attendee webhook signature verification enabled');
  } else {
    console.log('[Webhook] WARNING: ATTENDEE_WEBHOOK_SECRET not set, webhook verification disabled');
  }
});
