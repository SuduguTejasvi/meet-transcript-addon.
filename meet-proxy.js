// Minimal proxy to call Google Meet Media API from server to avoid browser CORS

const express = require('express');
const cors = require('cors');
// Using Node 18+ built-in fetch (no need for node-fetch)

const app = express();
const PORT = process.env.PORT || 8787;
const ALLOWED_ORIGINS = [
  'http://localhost:8081',
  'http://127.0.0.1:8081',
  'http://localhost:8000',
  'http://127.0.0.1:8000',
];

app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json());

// Root route - helpful message
app.get('/', (req, res) => {
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
    if (!accessToken) return res.status(401).json({ error: 'missing_access_token' });
    if (!meetingCode) return res.status(400).json({ error: 'missing_meeting_code' });

    const url = `https://meet.googleapis.com/v2beta/spaces:lookup?meetingCode=${encodeURIComponent(meetingCode)}`;
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
    res.status(500).json({ error: 'proxy_error', message: err && err.message ? err.message : String(err) });
  }
});

// Get a specific transcript entry by full resource name
// name format: conferenceRecords/{confRecord}/transcripts/{transcript}/entries/{entry}
app.get('/api/transcripts/entry', async (req, res) => {
  try {
    const accessToken = req.get('x-access-token');
    const name = (req.query.name || '').toString().trim();
    if (!accessToken) return res.status(401).json({ error: 'missing_access_token' });
    if (!name) return res.status(400).json({ error: 'missing_name' });

    const url = `https://meet.googleapis.com/v2/${encodeURI(name)}`;
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
    res.status(500).json({ error: 'proxy_error', message: err && err.message ? err.message : String(err) });
  }
});

// List conference records for a space
// Query: spaceName=spaces/AAAA-BBBB-CCC
app.get('/api/conferenceRecords', async (req, res) => {
  try {
    const accessToken = req.get('x-access-token');
    const spaceName = (req.query.spaceName || '').toString().trim();
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
    res.status(500).json({ error: 'proxy_error', message: err && err.message ? err.message : String(err) });
  }
});

// List transcripts under a conference record
// Query: conferenceRecord=conferenceRecords/ID
app.get('/api/transcripts', async (req, res) => {
  try {
    const accessToken = req.get('x-access-token');
    const conferenceRecord = (req.query.conferenceRecord || '').toString().trim();
    if (!accessToken) return res.status(401).json({ error: 'missing_access_token' });
    if (!conferenceRecord) return res.status(400).json({ error: 'missing_conference_record' });

    const url = `https://meet.googleapis.com/v2beta/${encodeURI(conferenceRecord)}/transcripts`;
    const upstream = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    const text = await upstream.text();
    res.status(upstream.status);
    try { res.type('application/json').send(JSON.stringify(JSON.parse(text))); }
    catch (_) { res.type('text/plain').send(text); }
  } catch (err) {
    res.status(500).json({ error: 'proxy_error', message: err && err.message ? err.message : String(err) });
  }
});

// List entries under a transcript
// Query: transcript=conferenceRecords/ID/transcripts/ID
app.get('/api/transcripts/entries', async (req, res) => {
  try {
    const accessToken = req.get('x-access-token');
    const transcript = (req.query.transcript || '').toString().trim();
    if (!accessToken) return res.status(401).json({ error: 'missing_access_token' });
    if (!transcript) return res.status(400).json({ error: 'missing_transcript' });

    const url = `https://meet.googleapis.com/v2beta/${encodeURI(transcript)}/entries`;
    const upstream = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    const text = await upstream.text();
    res.status(upstream.status);
    try { res.type('application/json').send(JSON.stringify(JSON.parse(text))); }
    catch (_) { res.type('text/plain').send(text); }
  } catch (err) {
    res.status(500).json({ error: 'proxy_error', message: err && err.message ? err.message : String(err) });
  }
});

app.post('/api/connectActiveConference', async (req, res) => {
  try {
    const accessToken = req.get('x-access-token');
    const { spaceName, offer } = req.body || {};

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
    res.status(500).json({ error: 'proxy_error', message: err && err.message ? err.message : String(err) });
  }
});

// Verify space name by checking if it exists
app.get('/api/verifySpace', async (req, res) => {
  try {
    const accessToken = req.get('x-access-token');
    const spaceName = (req.query.spaceName || '').toString().trim();
    if (!accessToken) return res.status(401).json({ error: 'missing_access_token' });
    if (!spaceName) return res.status(400).json({ error: 'missing_space_name' });

    // Try to get space info to verify it exists
    const url = `https://meet.googleapis.com/v2beta/${encodeURI(spaceName)}`;
    const upstream = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    const text = await upstream.text();
    res.status(upstream.status);
    try {
      res.type('application/json').send(JSON.stringify(JSON.parse(text)));
    } catch (_) {
      res.type('text/plain').send(text);
    }
  } catch (err) {
    res.status(500).json({ error: 'proxy_error', message: err && err.message ? err.message : String(err) });
  }
});

// Fetch transcript from Google Docs by document ID
// Requires Google Docs API scope
app.get('/api/docs/transcript', async (req, res) => {
  try {
    const accessToken = req.get('x-access-token');
    const documentId = (req.query.documentId || '').toString().trim();
    if (!accessToken) return res.status(401).json({ error: 'missing_access_token' });
    if (!documentId) return res.status(400).json({ error: 'missing_document_id' });

    // Use Google Docs API to get document content
    const url = `https://docs.googleapis.com/v1/documents/${encodeURIComponent(documentId)}`;
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
    res.status(500).json({ error: 'proxy_error', message: err && err.message ? err.message : String(err) });
  }
});

app.get('/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Meet proxy listening on http://localhost:${PORT}`);
});
