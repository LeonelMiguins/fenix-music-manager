import {
    createPlaylistCard
}
from '../components/playlistCard.js';

import { navigateToPlaylist } from '../../../navigation.js';

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

    const cardsHtml =
        playlists.length > 0
            ? ''
            : `
                <div class="empty-state-card">
                    <strong>Nenhuma playlist encontrada</strong>
                    <span>Monte selecoes personalizadas para organizar trilhas e colecoes tematicas.</span>
                </div>
            `;

    main.innerHTML = `
        <section class="page-shell">
            <div class="page-header">
                <div>
                    <span class="section-kicker">Curadoria</span>
                    <h1>Playlists da biblioteca</h1>
                    <p>Organize selecoes por tema, artista ou momento sem perder o historico do acervo.</p>
                </div>
                <div class="page-header-meta">
                    <strong>${playlists.length}</strong>
                    <span>${playlists.length === 1 ? 'playlist registrada' : 'playlists registradas'}</span>
                </div>
            </div>
            ${cardsHtml}
            <div class="albums-grid"></div>
        </section>
    `;

    const grid =
        main.querySelector('.albums-grid');

    playlists.forEach(playlist => {

        const card =
            createPlaylistCard(
                playlist
            );

        card.addEventListener('click', () => {
            navigateToPlaylist(
                playlist.id
            );
        });

        grid.appendChild(card);

    });

}
