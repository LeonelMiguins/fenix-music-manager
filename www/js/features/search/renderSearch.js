import {
    createAlbumCard
}
from '../albums/components/albumCard.js';
import {
    createPlaylistCard
}
from '../playlists/components/playlistCard.js';

import {
    navigateToAlbum,
    navigateToPlaylist
}
from '../../navigation.js';

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

    const cardsHtml =
        results.length > 0
            ? ''
            : `
                <div class="empty-state-card">
                    <strong>Nenhum resultado encontrado</strong>
                    <span>Tente outro termo, artista ou nome de album para localizar itens da biblioteca.</span>
                </div>
            `;

    main.innerHTML = `
        <section class="page-shell">
            <div class="page-header">
                <div>
                    <span class="section-kicker">Pesquisa</span>
                    <h1>Resultados para "${query}"</h1>
                    <p>Resultados combinados entre albuns e playlists.</p>
                </div>
                <div class="page-header-meta">
                    <strong>${results.length}</strong>
                    <span>${results.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}</span>
                </div>
            </div>
            ${cardsHtml}
            <div class="albums-grid"></div>
        </section>
    `;

    const grid =
        main.querySelector('.albums-grid');

    results.forEach(item => {

        const card =
            item.type === 'playlist'
                ? createPlaylistCard(item)
                : createAlbumCard(item);

        card.addEventListener(
            'click',
            () => {

                if (
                    item.type === 'playlist'
                ) {
                    navigateToPlaylist(
                        item.id
                    );

                    return;
                }

                navigateToAlbum(
                    item.id
                );
            }
        );

        grid.appendChild(card);

    });
}
