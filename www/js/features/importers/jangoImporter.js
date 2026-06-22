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
    pendingMetaSince: 0
  };

  function normalize(value) {
    return String(value || '').trim().replace(/\\s+/g, ' ');
  }

  function getLatestAudioUrl() {
    const matches = performance
      .getEntriesByType('resource')
      .map(entry => entry.name)
      .filter(url => /m4a-64\\.jango\\.com|\\.m4a($|\\?)/i.test(url));

    return matches.at(-1) || '';
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.__jangoCaptureState = state;
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

  persist();
  captureCurrentTrack();
  window.__jangoCaptureInterval = setInterval(captureCurrentTrack, 1500);

  window.jangoCaptureExport = function () {
    const payload = {
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

    console.log('[Fenix Jango] export:', payload);
    return payload;
  };

  window.jangoCaptureStop = function () {
    clearInterval(window.__jangoCaptureInterval);
    persist();
    return window.jangoCaptureExport();
  };

  console.log('[Fenix Jango] captura iniciada. Use jangoCaptureStop() para finalizar e jangoCaptureExport() para ver o JSON.');
})();`;

function getJangoTextarea() {
    return document.getElementById('jango-json-input');
}

export function openJangoModal() {
    document
        .getElementById('modal-jango')
        .classList.remove('hidden');
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
}
