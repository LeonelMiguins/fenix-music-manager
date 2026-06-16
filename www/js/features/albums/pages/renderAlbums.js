import {
    createAlbumCard
}
from '../components/albumCard.js';

import {
    renderAlbumPage
}
from './renderAlbumPage.js';

export async function renderAlbums() {

    const main =
        document.getElementById(
            'main-container'
        );

    main.innerHTML = `
        <div class="loading">
            Carregando albums...
        </div>
    `;

    const response =
        await fetch('/api/albums');

    const albums =
        await response.json();

    main.innerHTML = '';

    const grid =
        document.createElement('div');

    grid.className =
        'albums-grid';

    albums.forEach(album => {

        const card =
            createAlbumCard(album);

        // =========================
        // CLICK
        // =========================

        card.addEventListener('click', () => {

            // salva o id do album atual no localstorage
            localStorage.setItem('CURRENT_ALBUM_ID', album.id)
            renderAlbumPage(
                album.id
            );

        });

        grid.appendChild(card);

    });

    main.appendChild(grid);
}
