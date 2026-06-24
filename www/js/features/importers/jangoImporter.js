import {
    openAlbumModal,
    fillAlbumModal
} from '../albums/modals/modalAlbum.js';

const JANGO_CAPTURE_SNIPPET = `(function () {
  const STORAGE_KEY = '__fenix_jango_capture__';
  const state = window.__jangoCaptureState || {
    stationUrl: location.href,
    stationName: document.querySelector('h1')?.textContent?.trim() || document.title,
    startedAt: new Date().toISOString(),
    tracks: [],
    lastKey: '',
    lastCommittedUrl: '',
    pendingMetaKey: '',
    pendingMetaSince: 0,
    latestAudioUrl: '',
    history: []
  };
  const PANEL_ID = '__fenix_jango_panel__';
  const PANEL_STYLE_ID = '__fenix_jango_panel_style__';

  function normalize(value) {
    return String(value || '').trim().replace(/\\s+/g, ' ');
  }

  function isAudioUrl(url) {
    return /m4a-64\\.jango\\.com|\\.m4a($|\\?)/i.test(String(url || ''));
  }

  function registerAudioUrl(url, source) {
    const normalizedUrl = String(url || '').trim();

    if (!isAudioUrl(normalizedUrl)) {
      return;
    }

    state.latestAudioUrl = normalizedUrl;
    state.history.push({
      type: 'audio-url',
      source,
      url: normalizedUrl,
      at: new Date().toISOString()
    });

    if (state.history.length > 60) {
      state.history = state.history.slice(-60);
    }

    persist();
  }

  function getLatestAudioUrl() {
    const audioEl = document.querySelector('audio');

    if (audioEl?.currentSrc && isAudioUrl(audioEl.currentSrc)) {
      return audioEl.currentSrc;
    }

    if (audioEl?.src && isAudioUrl(audioEl.src)) {
      return audioEl.src;
    }

    if (state.latestAudioUrl && isAudioUrl(state.latestAudioUrl)) {
      return state.latestAudioUrl;
    }

    const matches = performance
      .getEntriesByType('resource')
      .map(entry => entry.name)
      .filter(isAudioUrl);

    return matches.at(-1) || state.latestAudioUrl || '';
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.__jangoCaptureState = state;
    renderPanel();
  }

  function ensurePanelStyle() {
    if (document.getElementById(PANEL_STYLE_ID)) {
      return;
    }

    const style = document.createElement('style');
    style.id = PANEL_STYLE_ID;
    style.textContent = \`
      #\${PANEL_ID} {
        position: fixed;
        left: 16px;
        top: 16px;
        width: 300px;
        max-height: 58vh;
        display: flex;
        flex-direction: column;
        z-index: 999999;
        background: rgba(15, 20, 29, 0.96);
        color: #f3f5fb;
        border: 1px solid rgba(108, 140, 255, 0.25);
        border-radius: 18px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
        backdrop-filter: blur(10px);
        overflow: hidden;
        font-family: Inter, system-ui, sans-serif;
      }
      #\${PANEL_ID} * { box-sizing: border-box; }
      #\${PANEL_ID} .fj-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        padding: 12px 14px;
        border-bottom: 1px solid rgba(255,255,255,0.08);
      }
      #\${PANEL_ID} .fj-title {
        font-size: 14px;
        font-weight: 700;
      }
      #\${PANEL_ID} .fj-sub {
        color: #9fb2ff;
        font-size: 11px;
      }
      #\${PANEL_ID} .fj-body {
        padding: 10px 12px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      #\${PANEL_ID} .fj-track {
        padding: 9px 10px;
        border-radius: 12px;
        background: #171c29;
        border: 1px solid rgba(255,255,255,0.06);
      }
      #\${PANEL_ID} .fj-track strong {
        display: block;
        font-size: 12px;
        margin-bottom: 3px;
        color: #fff;
      }
      #\${PANEL_ID} .fj-track span {
        display: block;
        font-size: 11px;
        color: #aeb7cd;
      }
      #\${PANEL_ID} .fj-empty {
        color: #8c95aa;
        font-size: 12px;
      }
      #\${PANEL_ID} .fj-actions {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 6px;
        padding: 10px 12px 12px;
        border-top: 1px solid rgba(255,255,255,0.08);
      }
      #\${PANEL_ID} .fj-btn {
        border: none;
        border-radius: 10px;
        padding: 9px 10px;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
      }
      #\${PANEL_ID} .fj-btn-primary {
        background: linear-gradient(135deg, #7c3aed, #9333ea);
        color: #fff;
      }
      #\${PANEL_ID} .fj-btn-secondary {
        background: #1b2130;
        color: #d8def0;
        border: 1px solid #31384b;
      }
      #\${PANEL_ID} .fj-btn-danger {
        background: #3a1f29;
        color: #ffd3db;
        border: 1px solid #6b3041;
      }
    \`;

    document.head.appendChild(style);
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function buildExportPayload() {
    return {
      type: 'playlist',
      album: state.stationName || 'Jango Playlist',
      artist: 'Jango Radio',
      related: '',
      year: '',
      genrer: '',
      cover: '',
      server: 'jango',
      author: 'Jango',
      sourceUrl: state.stationUrl,
      tracks: state.tracks
    };
  }

  function renderPanel() {
    ensurePanelStyle();

    let panel = document.getElementById(PANEL_ID);

    if (!panel) {
      panel = document.createElement('div');
      panel.id = PANEL_ID;
      document.body.appendChild(panel);
    }

    const tracksHtml = state.tracks.length
      ? state.tracks.slice().reverse().map((track, index) => \`
          <div class="fj-track">
            <strong>\${escapeHtml(track.title)}</strong>
            <span>\${escapeHtml(track.artist)}</span>
          </div>
        \`).join('')
      : '<div class="fj-empty">Nenhuma faixa capturada ainda.</div>';

    panel.innerHTML = \`
      <div class="fj-head">
        <div>
          <div class="fj-title">Captura Jango</div>
          <div class="fj-sub">\${state.tracks.length} \${state.tracks.length === 1 ? 'faixa' : 'faixas'} capturadas</div>
        </div>
      </div>
      <div class="fj-body">\${tracksHtml}</div>
      <div class="fj-actions">
        <button type="button" class="fj-btn fj-btn-primary" data-fj-action="copy">Copiar JSON</button>
        <button type="button" class="fj-btn fj-btn-secondary" data-fj-action="download">Baixar</button>
        <button type="button" class="fj-btn fj-btn-danger" data-fj-action="stop">Parar</button>
      </div>
    \`;

    panel.querySelector('[data-fj-action="copy"]')?.addEventListener('click', async () => {
      const payload = JSON.stringify(buildExportPayload(), null, 2);
      try {
        await navigator.clipboard.writeText(payload);
        console.log('[Fenix Jango] JSON copiado.');
      } catch (err) {
        console.log('[Fenix Jango] Falha ao copiar JSON.', err);
      }
    });

    panel.querySelector('[data-fj-action="download"]')?.addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(buildExportPayload(), null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'jango-capture.json';
      link.click();
      URL.revokeObjectURL(url);
    });

    panel.querySelector('[data-fj-action="stop"]')?.addEventListener('click', () => {
      window.jangoCaptureStop();
      console.log('[Fenix Jango] Captura parada.');
    });
  }

  function patchAudioTracking() {
    if (window.__jangoAudioPatched) {
      return;
    }

    window.__jangoAudioPatched = true;

    const mediaProto = HTMLMediaElement.prototype;
    const srcDescriptor = Object.getOwnPropertyDescriptor(mediaProto, 'src');

    if (srcDescriptor?.set && srcDescriptor?.get) {
      Object.defineProperty(mediaProto, 'src', {
        configurable: true,
        enumerable: srcDescriptor.enumerable,
        get() {
          return srcDescriptor.get.call(this);
        },
        set(value) {
          registerAudioUrl(value, 'media-src');
          return srcDescriptor.set.call(this, value);
        }
      });
    }

    const originalSetAttribute = mediaProto.setAttribute;

    mediaProto.setAttribute = function (name, value) {
      if (String(name).toLowerCase() === 'src') {
        registerAudioUrl(value, 'setAttribute');
      }

      return originalSetAttribute.call(this, name, value);
    };

    const originalLoad = mediaProto.load;

    mediaProto.load = function (...args) {
      registerAudioUrl(this.currentSrc || this.src, 'load');
      return originalLoad.apply(this, args);
    };
  }

  function startObservers() {
    patchAudioTracking();

    const observer = new MutationObserver(() => {
      const audioEl = document.querySelector('audio');
      if (audioEl) {
        registerAudioUrl(audioEl.currentSrc || audioEl.src, 'mutation');
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src']
    });

    window.__jangoCaptureObserver = observer;
  }

  function captureCurrentTrack() {
    const title = normalize(document.querySelector('#player-song-title a')?.textContent);
    const artist = normalize(document.querySelector('#player-artist a')?.textContent);
    const url = getLatestAudioUrl();
    const metaKey = [title, artist].join('::');
    const now = Date.now();

    if (!title || !artist) {
      return;
    }

    if (metaKey !== state.pendingMetaKey) {
      state.pendingMetaKey = metaKey;
      state.pendingMetaSince = now;
      persist();
      return;
    }

    if (!url || url === state.lastCommittedUrl) {
      return;
    }

    if (now - state.pendingMetaSince < 1200) {
      return;
    }

    const key = [title, artist, url].join('::');

    if (state.lastKey === key || state.tracks.some(track => [track.title, track.artist, track.url].join('::') === key)) {
      return;
    }

    state.lastKey = key;
    state.lastCommittedUrl = url;
    state.tracks.push({
      title,
      artist,
      url
    });

    state.pendingMetaSince = now;

    persist();
    console.log('[Fenix Jango] capturada:', title, '-', artist);
  }

  if (window.__jangoCaptureInterval) {
    clearInterval(window.__jangoCaptureInterval);
  }

  if (window.__jangoCaptureObserver) {
    window.__jangoCaptureObserver.disconnect();
  }

  startObservers();
  persist();
  captureCurrentTrack();
  window.__jangoCaptureInterval = setInterval(captureCurrentTrack, 1000);

  window.jangoCaptureExport = function () {
    const payload = buildExportPayload();

    console.log('[Fenix Jango] export:', payload);
    return payload;
  };

  window.jangoCaptureStop = function () {
    clearInterval(window.__jangoCaptureInterval);
    if (window.__jangoCaptureObserver) {
      window.__jangoCaptureObserver.disconnect();
    }
    persist();
    return window.jangoCaptureExport();
  };

  renderPanel();
  console.log('[Fenix Jango] captura iniciada. Painel flutuante ativo. Use jangoCaptureStop() para finalizar e jangoCaptureExport() para ver o JSON.');
})();`;

function getJangoTextarea() {
    return document.getElementById('jango-json-input');
}

function renderJangoPreview(tracks = []) {
    const countEl =
        document.getElementById(
            'jango-preview-count'
        );

    const listEl =
        document.getElementById(
            'jango-preview-list'
        );

    countEl.textContent =
        `${tracks.length} ${tracks.length === 1 ? 'faixa' : 'faixas'}`;

    if (!tracks.length) {
        listEl.innerHTML = `
            <div class="jango-preview-empty">
                Cole o JSON para visualizar as musicas capturadas.
            </div>
        `;
        return;
    }

    listEl.innerHTML =
        tracks.map((track, index) => `
            <div class="jango-preview-item">
                <strong>${index + 1}. ${track.title || 'Sem titulo'}</strong>
                <span>${track.artist || 'Artista nao informado'}</span>
            </div>
        `).join('');
}

function parseJangoPayload() {
    const rawValue =
        getJangoTextarea()
            .value
            .trim();

    if (!rawValue) {
        return null;
    }

    return JSON.parse(rawValue);
}

function updateJangoPreviewFromTextarea() {
    try {
        const parsed =
            parseJangoPayload();

        const tracks =
            Array.isArray(parsed?.tracks)
                ? parsed.tracks
                : [];

        renderJangoPreview(tracks);
    } catch {
        renderJangoPreview([]);
    }
}

export function openJangoModal() {
    document
        .getElementById('modal-jango')
        .classList.remove('hidden');

    updateJangoPreviewFromTextarea();
}

export function closeJangoModal() {
    document
        .getElementById('modal-jango')
        .classList.add('hidden');
}

export async function copyJangoCaptureScript() {
    const feedback =
        document.getElementById(
            'jango-copy-feedback'
        );

    try {
        await navigator.clipboard.writeText(
            JANGO_CAPTURE_SNIPPET
        );

        feedback.textContent =
            'Script copiado. Cole no console da página do Jango.';
    } catch (err) {
        console.error(err);
        feedback.textContent =
            'Nao foi possivel copiar automaticamente.';
    }
}

export function importJangoCapturedJson() {
    const error =
        document.getElementById(
            'jango-error'
        );

    const rawValue =
        getJangoTextarea()
            .value
            .trim();

    error.textContent = '';

    if (!rawValue) {
        error.textContent =
            'Cole o JSON capturado do Jango.';
        return;
    }

    try {
        const parsed =
            JSON.parse(rawValue);

        const album = {
            type:
                parsed.type || 'playlist',
            album:
                parsed.album || parsed.stationName || 'Jango Playlist',
            artist:
                parsed.artist || 'Jango Radio',
            related:
                parsed.related || '',
            year:
                parsed.year || '',
            genrer:
                parsed.genrer || parsed.genre || '',
            cover:
                parsed.cover || '',
            server:
                parsed.server || 'jango',
            author:
                parsed.author || 'Jango',
            tracks:
                Array.isArray(parsed.tracks)
                    ? parsed.tracks
                    : []
        };

        if (album.tracks.length === 0) {
            throw new Error(
                'JSON sem musicas.'
            );
        }

        closeJangoModal();
        openAlbumModal();
        fillAlbumModal(album);
    } catch (err) {
        error.textContent =
            err.message || 'JSON invalido.';
    }
}

export function fillJangoExample() {
    getJangoTextarea().value = JSON.stringify({
        type: 'playlist',
        album: 'New K-Pop',
        artist: 'Jango Radio',
        related: '',
        year: '',
        genrer: 'K-Pop',
        cover: '',
        server: 'jango',
        author: 'Jango',
        sourceUrl: 'https://pt.jango.com/stations/401946068',
        tracks: [
            {
                title: 'IYWO',
                artist: 'I.M',
                url: 'https://m4a-64.jango.com/23/45/83/2345839912706733329.m4a'
            }
        ]
    }, null, 2);

    updateJangoPreviewFromTextarea();
}

const jangoTextarea =
    getJangoTextarea();

jangoTextarea?.addEventListener(
    'input',
    updateJangoPreviewFromTextarea
);
