// Simple local presign server for Deepgram WebSocket URLs
// Usage: node tools/presign-server.mjs
// Request: GET http://localhost:8787/presign?model=nova-2&language=en-US&... with header Authorization: Token <DG_API_KEY>

import http from 'http';
import { URL } from 'url';

const PORT = process.env.PORT ? Number(process.env.PORT) : 8787;

function send(res, status, data, headers = {}) {
  const body = typeof data === 'string' ? data : JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    ...headers,
  });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    send(res, 204, '');
    return;
  }

  const url = new URL(req.url || '', `http://${req.headers.host}`);

  if (req.method === 'GET' && url.pathname === '/presign') {
    const auth = req.headers['authorization'] || '';
    const token = auth.startsWith('Token ') ? auth.slice(6).trim() : '';
    if (!token) {
      send(res, 400, { error: 'Missing Authorization: Token <key>' });
      return;
    }

    try {
      const params = url.searchParams.toString();
      const apiUrl = `https://api.deepgram.com/v1/listen?${params}`;
      const dgResp = await fetch(apiUrl, {
        method: 'POST',
        headers: { Authorization: `Token ${token}` },
      });
      if (!dgResp.ok) {
        const text = await dgResp.text();
        send(res, dgResp.status, { error: 'Deepgram error', details: text });
        return;
      }
      const data = await dgResp.json();
      send(res, 200, data);
    } catch (e) {
      send(res, 500, { error: 'Presign server error', details: String(e.message || e) });
    }
    return;
  }

  send(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[presign] Listening on http://localhost:${PORT}`);
});


