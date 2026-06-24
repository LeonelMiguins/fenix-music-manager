import {
    createAlbumCard
}
from '../components/albumCard.js';

import { navigateToAlbum } from '../../../navigation.js';

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

    const cardsHtml =
        albums.length > 0
            ? ''
            : `
                <div class="empty-state-card">
                    <strong>Nenhum album encontrado</strong>
                    <span>Crie um novo item ou importe um album para iniciar a colecao.</span>
                </div>
            `;

    main.innerHTML = `
        <section class="page-shell">
            <div class="page-header">
                <div>
                    <span class="section-kicker">Colecao</span>
                    <h1>Albuns cadastrados</h1>
                    <p>Explore, reproduza e complemente os itens salvos no banco local.</p>
                </div>
                <div class="page-header-meta">
                    <strong>${albums.length}</strong>
                    <span>${albums.length === 1 ? 'album registrado' : 'albuns registrados'}</span>
                </div>
            </div>
            ${cardsHtml}
            <div class="albums-grid"></div>
        </section>
    `;

    const grid =
        main.querySelector('.albums-grid');

    albums.forEach(album => {

        const card =
            createAlbumCard(album);

        card.addEventListener('click', () => {
            navigateToAlbum(album.id);
        });

        grid.appendChild(card);

    });
}
