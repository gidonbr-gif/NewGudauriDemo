// Shared CORS policy for the public API endpoints.
// Only the site's own origins (plus Vercel preview deployments) may call
// these endpoints from a browser; other origins fall back to the production
// origin, so their cross-origin reads are blocked.
const ALLOWED_ORIGINS = new Set([
  'https://www.newgudauri.net',
  'https://newgudauri.net'
]);

export function applyCors(req, res) {
  const origin = (req.headers && req.headers.origin) || '';
  const allowed =
    ALLOWED_ORIGINS.has(origin) || /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)
      ? origin
      : 'https://www.newgudauri.net';
  res.setHeader('Access-Control-Allow-Origin', allowed);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
