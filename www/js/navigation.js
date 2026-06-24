import { renderHome } from './features/home/renderHome.js';
import { renderAlbums } from './features/albums/pages/renderAlbums.js';
import { renderAlbumPage } from './features/albums/pages/renderAlbumPage.js';
import { renderPlaylists } from './features/playlists/pages/renderPlaylists.js';
import { renderPlaylistPage } from './features/playlists/pages/renderPlaylistPage.js';
import { renderSearch } from './features/search/renderSearch.js';

function getNavigationButtons() {
    return document.querySelectorAll('[data-view]');
}

function setActiveView(viewName) {
    getNavigationButtons().forEach(button => {
        button.classList.toggle(
            'active',
            button.dataset.view === viewName
        );
    });
}

function normalizeHash(hashValue = '') {
    const trimmedHash =
        String(hashValue || '').trim();

    if (!trimmedHash || trimmedHash === '#') {
        return '#/home';
    }

    return trimmedHash.startsWith('#')
        ? trimmedHash
        : `#${trimmedHash}`;
}

function parseRoute() {
    const normalizedHash =
        normalizeHash(window.location.hash);

    const hashWithoutPrefix =
        normalizedHash.slice(1);

    const [pathPart, queryString = ''] =
        hashWithoutPrefix.split('?');

    const pathSegments =
        pathPart
            .split('/')
            .filter(Boolean);

    const searchParams =
        new URLSearchParams(queryString);

    const [section = 'home', itemId = ''] =
        pathSegments;

    return {
        section,
        itemId,
        query:
            searchParams.get('q') || ''
    };
}

async function renderCurrentRoute() {
    const route =
        parseRoute();

    if (route.section === 'albums' && route.itemId) {
        setActiveView('albums');
        localStorage.setItem(
            'CURRENT_ALBUM_ID',
            route.itemId
        );
        await renderAlbumPage(route.itemId);
        return;
    }

    if (route.section === 'albums') {
        setActiveView('albums');
        await renderAlbums();
        return;
    }

    if (route.section === 'playlists' && route.itemId) {
        setActiveView('playlists');
        localStorage.setItem(
            'CURRENT_PLAYLIST_ID',
            route.itemId
        );
        await renderPlaylistPage(route.itemId);
        return;
    }

    if (route.section === 'playlists') {
        setActiveView('playlists');
        await renderPlaylists();
        return;
    }

    if (route.section === 'search' && route.query) {
        setActiveView(null);
        await renderSearch(route.query);
        return;
    }

    setActiveView('home');
    await renderHome();
}

function updateRoute(hash, replace = false) {
    const normalizedHash =
        normalizeHash(hash);

    if (window.location.hash === normalizedHash) {
        renderCurrentRoute();
        return;
    }

    const nextUrl =
        `${window.location.pathname}${window.location.search}${normalizedHash}`;

    if (replace) {
        window.history.replaceState({}, '', nextUrl);
    } else {
        window.history.pushState({}, '', nextUrl);
    }

    renderCurrentRoute();
}

export function navigateToHome(options = {}) {
    updateRoute('#/home', options.replace === true);
}

export function navigateToAlbums(options = {}) {
    updateRoute('#/albums', options.replace === true);
}

export function navigateToAlbum(albumId, options = {}) {
    updateRoute(
        `#/albums/${albumId}`,
        options.replace === true
    );
}

export function navigateToPlaylists(options = {}) {
    updateRoute('#/playlists', options.replace === true);
}

export function navigateToPlaylist(playlistId, options = {}) {
    updateRoute(
        `#/playlists/${playlistId}`,
        options.replace === true
    );
}

export function navigateToSearch(query, options = {}) {
    updateRoute(
        `#/search?q=${encodeURIComponent(query)}`,
        options.replace === true
    );
}

export function initNavigation() {
    window.addEventListener(
        'hashchange',
        renderCurrentRoute
    );

    if (!window.location.hash) {
        window.history.replaceState(
            {},
            '',
            `${window.location.pathname}${window.location.search}#/home`
        );
    }

    renderCurrentRoute();
}
