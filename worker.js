// Cloudflare Worker — 3D Landmark Viewer (v9)
//
// v9: switched to Sketchfab embed viewer. The Worker proxies Sketchfab's
// public search API (/v3/search) to avoid browser CORS constraints, then
// the browser loads the selected model via Sketchfab's embed iframe.
// Real community-uploaded geometry replaces the procedural shapes in v1-v8.
//
// Routes:
//   GET /            → index.html
//   GET /api/search  → Sketchfab search proxy, returns trimmed JSON

import html from './index.html';

const SKETCHFAB_SEARCH = 'https://api.sketchfab.com/v3/search';

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Search proxy — calls Sketchfab, returns only what the client needs
    if (url.pathname === '/api/search') {
      const q = (url.searchParams.get('q') || '').trim();
      const count = Math.min(parseInt(url.searchParams.get('count') || '8', 10), 12);

      if (!q) {
        return new Response(JSON.stringify({ results: [] }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      try {
        const sfResp = await fetch(
          `${SKETCHFAB_SEARCH}?q=${encodeURIComponent(q)}&type=models&count=${count}`,
          { headers: { Accept: 'application/json' } },
        );

        if (!sfResp.ok) {
          return new Response(JSON.stringify({ results: [], error: 'search_unavailable' }), {
            headers: { 'Content-Type': 'application/json' },
          });
        }

        const data = await sfResp.json();

        // Return only the fields the client uses
        const results = (data.results || []).map(m => ({
          uid: m.uid,
          name: m.name,
          author: m.user?.displayName || m.user?.username || '',
          embedUrl: m.embedUrl,
          viewerUrl: m.viewerUrl,
          isDownloadable: !!m.isDownloadable,
          thumbnail: m.thumbnails?.images?.[1]?.url || m.thumbnails?.images?.[0]?.url || '',
          license: m.license?.label || '',
          faceCount: m.faceCount || 0,
        }));

        return new Response(JSON.stringify({ results }), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=60',
          },
        });
      } catch (_) {
        return new Response(JSON.stringify({ results: [], error: 'search_error' }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Main page
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=UTF-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  },
};
