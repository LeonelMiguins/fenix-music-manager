import {
    createAlbumCard
}
from '../albums/components/albumCard.js';

import {
    renderAlbumPage
}
from '../albums/pages/renderAlbumPage.js';

import {
    renderPlaylistPage
}
from '../playlists/pages/renderPlaylistPage.js';

export async function renderSearch(query) {

    const main =
        document.getElementById(
            'main-container'
        );

    main.innerHTML =
        '<div class="loading">Pesquisando...</div>';

    const response =
        await fetch(
            `/api/search?q=${encodeURIComponent(query)}`
        );

    const results =
        await response.json();

    main.innerHTML = '';

    const grid =
        document.createElement('div');

    grid.className =
        'albums-grid';

    results.forEach(item => {

        const card =
            createAlbumCard(item);

        card.addEventListener(
            'click',
            () => {

                if (
                    item.type === 'playlist'
                ) {

                    renderPlaylistPage(
                        item.id
                    );

                } else {

                    renderAlbumPage(
                        item.id
                    );
                }

            }
        );

        grid.appendChild(card);

    });

    main.appendChild(grid);
}
