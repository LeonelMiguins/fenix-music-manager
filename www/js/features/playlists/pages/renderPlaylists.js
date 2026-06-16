import {
    createPlaylistCard
}
from '../components/playlistCard.js';

import {
    renderPlaylistPage
}
from './renderPlaylistPage.js';

export async function renderPlaylists() {

    const main =
        document.getElementById(
            'main-container'
        );

    main.innerHTML = `
        <div class="loading">
            Carregando playlists...
        </div>
    `;

    const response =
        await fetch('/api/playlists');

    const playlists =
        await response.json();

    main.innerHTML = '';

    const grid =
        document.createElement('div');

    grid.className =
        'albums-grid';

    playlists.forEach(playlist => {

        const card =
            createPlaylistCard(
                playlist
            );

        // =========================
        // CLICK
        // =========================

        card.addEventListener('click', () => {

            localStorage.setItem(
                'CURRENT_PLAYLIST_ID',
                playlist.id
            );

            renderPlaylistPage(
                playlist.id
            );

        });

        grid.appendChild(card);

    });

    main.appendChild(grid);

}
