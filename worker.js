// Cloudflare Worker serving the 3D Landmark Viewer.
//
// v7: Three.js and its addons are bundled (esbuild) into three-bundle.js.txt and
// served from THIS origin at /three-bundle.js. The page's importmap points at that
// same-origin path, so the browser makes zero third-party requests for the engine.
// v4-v6 loaded Three.js from esm.sh / jsDelivr and the module failed to load on the
// customer's network (blocked / proxied / timed out), showing the misleading
// "3D engine did not load" error even on up-to-date Chrome.
import html from './index.html';
import threeBundle from './three-bundle.js.txt';

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === '/three-bundle.js') {
      return new Response(threeBundle, {
        headers: {
          'Content-Type': 'text/javascript; charset=UTF-8',
          // The bundle is content-addressed by app version; safe to cache hard.
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=UTF-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  },
};
