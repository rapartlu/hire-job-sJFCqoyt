const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>3D Landmark Finder</title>
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ctext y='52' font-size='52'%3E%F0%9F%9B%8F%3C/text%3E%3C/svg%3E">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #0b0c10;
      --surface: #12131a;
      --surface2: #1a1b25;
      --accent: #5b8cff;
      --accent2: #8fb4ff;
      --text: #e8eaf0;
      --muted: #7a7d92;
      --border: #252733;
      --footer-bg: #0d0e14;
    }
    html, body { width: 100%; height: 100%; background: var(--bg); color: var(--text); font-family: 'Inter', system-ui, -apple-system, sans-serif; }
    #app { display: flex; flex-direction: column; height: 100vh; }

    #header {
      flex: 0 0 auto; padding: 14px 20px 12px;
      background: var(--surface); border-bottom: 1px solid var(--border);
      display: flex; align-items: center; gap: 16px;
    }
    #logo { font-size: 18px; font-weight: 700; letter-spacing: -0.5px; color: var(--text); white-space: nowrap; }
    #logo span { color: var(--accent); }
    #search-wrap { position: relative; flex: 1; max-width: 560px; }
    #search-input {
      width: 100%; padding: 10px 40px 10px 14px;
      background: var(--bg); border: 1px solid var(--border);
      border-radius: 8px; color: var(--text); font-size: 15px;
      outline: none; transition: border-color 0.15s;
    }
    #search-input:focus { border-color: var(--accent); }
    #search-input::placeholder { color: var(--muted); }
    #search-icon { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: var(--muted); pointer-events: none; }
    #search-icon.hidden { display: none; }
    #search-clear { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--muted); cursor: pointer; font-size: 18px; display: none; padding: 0 4px; line-height: 1; }
    #search-clear.visible { display: block; }

    #dropdown {
      position: absolute; top: calc(100% + 6px); left: 0; right: 0;
      background: var(--surface2); border: 1px solid var(--border);
      border-radius: 8px; overflow: hidden; z-index: 100;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      display: none; max-height: 300px; overflow-y: auto;
    }
    #dropdown.open { display: block; }
    .result-item { display: flex; align-items: center; gap: 12px; padding: 10px 14px; cursor: pointer; transition: background 0.1s; border-bottom: 1px solid var(--border); }
    .result-item:last-child { border-bottom: none; }
    .result-item:hover, .result-item.active { background: rgba(91,140,255,0.15); }
    .result-thumb { width: 52px; height: 38px; border-radius: 4px; object-fit: cover; background: var(--border); flex-shrink: 0; }
    .result-info { flex: 1; min-width: 0; }
    .result-name { font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .result-meta { font-size: 12px; color: var(--muted); margin-top: 2px; }
    #dropdown-status { padding: 12px 14px; color: var(--muted); font-size: 14px; }

    #body { flex: 1 1 auto; display: flex; min-height: 0; }
    #viewer { flex: 1; position: relative; min-height: 0; }
    #embed-iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: none; display: none; }

    #empty-state {
      position: absolute; inset: 0;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 14px; padding: 20px;
    }
    #empty-emoji { font-size: 64px; line-height: 1; }
    #empty-title { font-size: 22px; font-weight: 600; text-align: center; }
    #empty-sub { font-size: 14px; color: var(--muted); text-align: center; max-width: 400px; line-height: 1.6; }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; max-width: 500px; }
    .chip { padding: 6px 14px; border: 1px solid var(--border); border-radius: 20px; font-size: 13px; cursor: pointer; color: var(--muted); transition: all 0.15s; background: var(--surface); }
    .chip:hover { border-color: var(--accent); color: var(--accent2); background: rgba(91,140,255,0.08); }

    #loading-overlay {
      position: absolute; inset: 0; z-index: 10; display: none;
      align-items: center; justify-content: center; flex-direction: column; gap: 12px;
      background: var(--bg);
    }
    #loading-overlay.visible { display: flex; }
    .spinner { width: 40px; height: 40px; border-radius: 50%; border: 3px solid var(--border); border-top-color: var(--accent); animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    #loading-label { font-size: 14px; color: var(--muted); }

    #sidebar { width: 260px; flex-shrink: 0; background: var(--surface); border-left: 1px solid var(--border); display: none; flex-direction: column; overflow-y: auto; }
    #sidebar.open { display: flex; }
    #sidebar-header { padding: 16px; border-bottom: 1px solid var(--border); }
    #sidebar-name { font-size: 15px; font-weight: 600; line-height: 1.4; }
    #sidebar-author { font-size: 12px; color: var(--muted); margin-top: 3px; }
    .sidebar-section { padding: 12px 16px; border-bottom: 1px solid var(--border); }
    .sidebar-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); margin-bottom: 6px; }
    .sidebar-value { font-size: 13px; }
    .sidebar-btn { display: inline-block; margin-top: 8px; padding: 7px 14px; background: var(--accent); color: #fff; border-radius: 6px; font-size: 13px; font-weight: 500; text-decoration: none; transition: opacity 0.15s; cursor: pointer; border: none; }
    .sidebar-btn:hover { opacity: 0.85; }
    .sidebar-btn-ghost { display: inline-block; margin-top: 8px; margin-left: 6px; padding: 7px 14px; border: 1px solid var(--border); color: var(--muted); border-radius: 6px; font-size: 13px; text-decoration: none; cursor: pointer; transition: all 0.15s; }
    .sidebar-btn-ghost:hover { border-color: var(--accent); color: var(--accent2); }

    footer { flex: 0 0 auto; background: var(--footer-bg); border-top: 1px solid var(--border); padding: 8px 20px; display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: var(--muted); }
    footer a { color: var(--muted); text-decoration: none; }
    footer a:hover { color: var(--accent2); }
    @media (max-width: 600px) { #sidebar { display: none !important; } #logo { font-size: 15px; } }
  </style>
</head>
<body>
<div id="app">
  <div id="header">
    <div id="logo">3D<span>Landmark</span></div>
    <div id="search-wrap">
      <input id="search-input" type="text"
        placeholder="Search any landmark - try &quot;Big Ben&quot; or &quot;Pyramids&quot;"
        autocomplete="off" spellcheck="false" aria-label="Search landmarks">
      <svg id="search-icon" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <button id="search-clear" aria-label="Clear search">&times;</button>
      <div id="dropdown">
        <div id="dropdown-status"></div>
      </div>
    </div>
  </div>

  <div id="body">
    <div id="viewer">
      <div id="empty-state">
        <div id="empty-emoji">🏛️</div>
        <div id="empty-title">Search any famous landmark</div>
        <div id="empty-sub">Type a name above and we'll find a real 3D model - any landmark, anywhere.</div>
        <div class="chips" style="margin-top:4px">
          <span class="chip" data-q="Eiffel Tower">Eiffel Tower</span>
          <span class="chip" data-q="Big Ben">Big Ben</span>
          <span class="chip" data-q="Colosseum Rome">Colosseum</span>
          <span class="chip" data-q="Taj Mahal">Taj Mahal</span>
          <span class="chip" data-q="Sagrada Familia">Sagrada Familia</span>
          <span class="chip" data-q="Statue of Liberty">Statue of Liberty</span>
          <span class="chip" data-q="Sydney Opera House">Sydney Opera House</span>
          <span class="chip" data-q="Pantheon Rome">Pantheon</span>
        </div>
      </div>
      <div id="loading-overlay">
        <div class="spinner"></div>
        <div id="loading-label">Searching...</div>
      </div>
      <iframe id="embed-iframe"
        allow="autoplay; fullscreen; xr-spatial-tracking"
        allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true">
      </iframe>
    </div>
    <div id="sidebar">
      <div id="sidebar-header">
        <div id="sidebar-name"></div>
        <div id="sidebar-author"></div>
      </div>
      <div class="sidebar-section">
        <div class="sidebar-label">Views on Sketchfab</div>
        <div class="sidebar-value" id="sidebar-views">-</div>
      </div>
      <div class="sidebar-section">
        <div class="sidebar-label">Actions</div>
        <a id="sidebar-page-link" class="sidebar-btn" href="#" target="_blank" rel="noopener">View on Sketchfab</a>
        <button class="sidebar-btn-ghost" onclick="clearViewer()">New search</button>
      </div>
      <div class="sidebar-section">
        <div class="sidebar-label">Note</div>
        <div class="sidebar-value" style="font-size:12px;color:var(--muted);line-height:1.5">
          Models are from Sketchfab's public library. Download is available on Sketchfab (free account required).
        </div>
      </div>
    </div>
  </div>

  <footer>
    <span>Built by Fleet &middot; Alpha access &middot; v4.1</span>
    <span><a href="https://autonomous-fleet.workers.dev" target="_blank" rel="noopener">autonomous-fleet.workers.dev</a></span>
  </footer>
</div>
<script>
const searchInput = document.getElementById('search-input');
const dropdown = document.getElementById('dropdown');
const dropdownStatus = document.getElementById('dropdown-status');
const embedIframe = document.getElementById('embed-iframe');
const emptyState = document.getElementById('empty-state');
const loadingOverlay = document.getElementById('loading-overlay');
const loadingLabel = document.getElementById('loading-label');
const sidebar = document.getElementById('sidebar');
const searchIcon = document.getElementById('search-icon');
const searchClear = document.getElementById('search-clear');

let debounce = null;
let results = [];
let activeIdx = -1;

// Quick-access chips
document.querySelectorAll('.chip[data-q]').forEach(chip => {
  chip.addEventListener('click', () => doSearch(chip.dataset.q));
});

searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim();
  toggleClear(q);
  if (q.length < 2) { closeDropdown(); return; }
  clearTimeout(debounce);
  debounce = setTimeout(() => fetchSuggestions(q), 320);
});

searchInput.addEventListener('keydown', e => {
  const items = [...dropdown.querySelectorAll('.result-item')];
  if (e.key === 'ArrowDown') { e.preventDefault(); activeIdx = Math.min(activeIdx+1, items.length-1); refreshActive(items); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); activeIdx = Math.max(activeIdx-1, 0); refreshActive(items); }
  else if (e.key === 'Enter') { e.preventDefault(); if (activeIdx >= 0 && results[activeIdx]) selectResult(results[activeIdx]); else if (searchInput.value.trim()) doSearch(searchInput.value.trim()); }
  else if (e.key === 'Escape') closeDropdown();
});

searchClear.addEventListener('click', () => { searchInput.value=''; toggleClear(''); closeDropdown(); searchInput.focus(); });
document.addEventListener('click', e => { if (!document.getElementById('search-wrap').contains(e.target)) closeDropdown(); });

function toggleClear(q) {
  searchClear.classList.toggle('visible', !!q);
  searchIcon.classList.toggle('hidden', !!q);
}

function refreshActive(items) {
  items.forEach((el, i) => el.classList.toggle('active', i === activeIdx));
  if (items[activeIdx]) items[activeIdx].scrollIntoView({ block:'nearest' });
}

function closeDropdown() { dropdown.classList.remove('open'); activeIdx=-1; results=[]; }

async function fetchSuggestions(q) {
  dropdownStatus.textContent = 'Searching...';
  dropdownStatus.style.display = 'block';
  dropdown.querySelectorAll('.result-item').forEach(el => el.remove());
  dropdown.classList.add('open');
  try {
    const r = await fetch('/api/search?q=' + encodeURIComponent(q));
    if (!r.ok) throw new Error('err');
    const data = await r.json();
    results = data.results || [];
    if (!results.length) { dropdownStatus.textContent = 'No models found for "' + esc(q) + '".'; return; }
    dropdownStatus.style.display = 'none';
    results.forEach((item, i) => {
      const div = document.createElement('div');
      div.className = 'result-item';
      div.innerHTML = '<img class="result-thumb" src="' + (item.thumbnail||'') + '" alt="" onerror="this.style.display=\'none\'">' +
        '<div class="result-info"><div class="result-name">' + esc(item.name) + '</div>' +
        '<div class="result-meta">' + (item.viewCount ? item.viewCount.toLocaleString()+' views' : '') + '</div></div>';
      div.addEventListener('mousedown', e => { e.preventDefault(); selectResult(item); });
      dropdown.appendChild(div);
    });
  } catch(e) { dropdownStatus.textContent = 'Search failed. Try again.'; }
}

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function doSearch(q) {
  searchInput.value = q;
  toggleClear(q);
  fetchSuggestions(q).then(() => setTimeout(() => { if (results.length) selectResult(results[0]); }, 500));
}

function selectResult(item) {
  closeDropdown();
  emptyState.style.display = 'none';
  embedIframe.style.display = 'none';
  loadingLabel.textContent = 'Loading "' + item.name + '"...';
  loadingOverlay.classList.add('visible');

  // Update sidebar immediately while model loads
  document.getElementById('sidebar-name').textContent = item.name;
  document.getElementById('sidebar-author').textContent = item.author ? 'by ' + item.author : '';
  document.getElementById('sidebar-views').textContent = item.viewCount ? item.viewCount.toLocaleString() : '-';
  document.getElementById('sidebar-page-link').href = item.pageUrl || '#';
  sidebar.classList.add('open');

  // Keep spinner visible until iframe load event fires (not a fixed timer)
  const fallbackTimer = setTimeout(() => {
    embedIframe.style.display = 'block';
    loadingOverlay.classList.remove('visible');
  }, 25000);

  embedIframe.onload = () => {
    clearTimeout(fallbackTimer);
    embedIframe.style.display = 'block';
    loadingOverlay.classList.remove('visible');
  };

  embedIframe.src = '';
  embedIframe.src = item.embedUrl + '?autostart=1&ui_theme=dark&ui_infos=0&ui_stop=0';
}

function clearViewer() {
  embedIframe.onload = null;
  embedIframe.src = ''; embedIframe.style.display = 'none';
  emptyState.style.display = 'flex'; sidebar.classList.remove('open');
  searchInput.value = ''; toggleClear(''); searchInput.focus();
}
</script>
</body>
</html>`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/search') {
      const q = (url.searchParams.get('q') || '').trim();
      if (q.length < 2) {
        return new Response(JSON.stringify({ results: [] }), {
          headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' }
        });
      }
      try {
        const sfRes = await fetch(
          `https://api.sketchfab.com/v3/search?type=models&q=${encodeURIComponent(q)}&count=6&downloadable=false`,
          { headers: { 'User-Agent': '3DLandmarkFinder/4.1 (autonomous-fleet.workers.dev)' } }
        );
        if (!sfRes.ok) throw new Error(`sketchfab ${sfRes.status}`);
        const data = await sfRes.json();
        const results = (data.results || []).map(m => ({
          uid: m.uid,
          name: m.name,
          author: m.user?.username || null,
          embedUrl: m.embedUrl || `https://sketchfab.com/models/${m.uid}/embed`,
          pageUrl: m.viewerUrl || `https://sketchfab.com/3d-models/${m.uid}`,
          thumbnail: m.thumbnails?.images?.[0]?.url || null,
          viewCount: m.viewCount || 0,
        }));
        return new Response(JSON.stringify({ results }), {
          headers: {
            'content-type': 'application/json',
            'access-control-allow-origin': '*',
            'cache-control': 'no-cache, no-store, must-revalidate',
          }
        });
      } catch (err) {
        return new Response(JSON.stringify({ results: [], error: String(err) }), {
          status: 502,
          headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' }
        });
      }
    }

    return new Response(HTML, {
      headers: {
        'content-type': 'text/html; charset=UTF-8',
        'cache-control': 'no-cache, no-store, must-revalidate',
      }
    });
  }
};
