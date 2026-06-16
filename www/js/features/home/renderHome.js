import { renderAlbums } from '../albums/pages/renderAlbums.js';
import { renderPlaylists } from '../playlists/pages/renderPlaylists.js';
import { renderAlbumPage } from '../albums/pages/renderAlbumPage.js';
import { renderPlaylistPage } from '../playlists/pages/renderPlaylistPage.js';

function formatSourceLabel(value) {
    if (!value) {
        return 'Sem origem';
    }

    return value
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

export async function renderHome() {
    const main =
        document.getElementById(
            'main-container'
        );

    main.innerHTML = `
        <section class="page-shell">
            <div class="page-loading-card">
                <span class="loading-dot"></span>
                Carregando panorama da biblioteca...
            </div>
        </section>
    `;

    const response =
        await fetch('/api/dashboard/summary');

    const summary =
        await response.json();

    const stats =
        summary.stats || {
            albums: 0,
            playlists: 0,
            tracks: 0,
            libraryItems: 0
        };

    const recentItems =
        summary.recentItems || [];

    const sources =
        summary.sources || [];

    const recentHtml =
        recentItems.length > 0
            ? recentItems.map(item => `
                <button
                    class="recent-item-card"
                    data-type="${item.type}"
                    data-id="${item.id}"
                >
                    <div class="recent-item-cover-wrap">
                        <img
                            class="recent-item-cover"
                            src="${item.cover || 'https://placehold.co/400x400'}"
                            alt="${item.titulo}"
                        >
                        <span class="recent-item-badge">
                            ${item.type === 'playlist' ? 'Playlist' : 'Album'}
                        </span>
                    </div>
                    <div class="recent-item-content">
                        <strong>${item.titulo}</strong>
                        <span>${item.artista_nome || 'Artista nao informado'}</span>
                        <small>${formatSourceLabel(item.servidor)}${item.ano ? ` • ${item.ano}` : ''}</small>
                    </div>
                </button>
            `).join('')
            : `
                <div class="empty-state-card">
                    <strong>Biblioteca vazia</strong>
                    <span>Crie um album ou importe conteudo para iniciar o acervo.</span>
                </div>
            `;

    const sourcesHtml =
        sources.length > 0
            ? sources.map(source => `
                <div class="source-item">
                    <span>${formatSourceLabel(source.servidor)}</span>
                    <strong>${source.total}</strong>
                </div>
            `).join('')
            : `
                <div class="empty-inline-state">
                    Nenhuma origem registrada ainda.
                </div>
            `;

    main.innerHTML = `
        <section class="page-shell home-shell">
            <section class="hero-panel">
                <div class="hero-copy">
                    <span class="eyebrow">Painel da biblioteca</span>
                    <h1>Seu acervo musical em um unico lugar.</h1>
                    <p>
                        Acompanhe o tamanho da colecao, consulte as ultimas adicoes
                        e pule direto para as acoes mais importantes sem sair da home.
                    </p>
                    <div class="hero-actions">
                        <button class="hero-btn hero-btn-primary" id="home-open-create">
                            Novo album
                        </button>
                        <button class="hero-btn hero-btn-secondary" id="home-open-albums">
                            Explorar biblioteca
                        </button>
                    </div>
                </div>

                <aside class="hero-highlight-card">
                    <span class="hero-highlight-label">Acervo total</span>
                    <strong>${stats.libraryItems}</strong>
                    <p>Itens entre albuns e playlists organizados no banco local.</p>
                    <div class="hero-highlight-grid">
                        <div>
                            <span>Albuns</span>
                            <strong>${stats.albums}</strong>
                        </div>
                        <div>
                            <span>Playlists</span>
                            <strong>${stats.playlists}</strong>
                        </div>
                        <div>
                            <span>Faixas</span>
                            <strong>${stats.tracks}</strong>
                        </div>
                    </div>
                </aside>
            </section>

            <section class="stats-grid">
                <article class="stat-card">
                    <span>Albuns</span>
                    <strong>${stats.albums}</strong>
                    <small>Colecao principal cadastrada</small>
                </article>
                <article class="stat-card">
                    <span>Playlists</span>
                    <strong>${stats.playlists}</strong>
                    <small>Selecoes curadas na biblioteca</small>
                </article>
                <article class="stat-card">
                    <span>Faixas</span>
                    <strong>${stats.tracks}</strong>
                    <small>Musicas distribuidas entre itens</small>
                </article>
                <article class="stat-card accent-card">
                    <span>Operacao</span>
                    <strong>Backup + Import</strong>
                    <small>Fluxo centralizado no topo da aplicacao</small>
                </article>
            </section>

            <section class="home-content-grid">
                <article class="content-card">
                    <div class="section-heading">
                        <div>
                            <span class="section-kicker">Recentes</span>
                            <h2>Ultimas entradas</h2>
                        </div>
                        <button class="text-action" id="home-open-playlists">
                            Ver playlists
                        </button>
                    </div>
                    <div class="recent-items-grid">
                        ${recentHtml}
                    </div>
                </article>

                <aside class="content-card content-card-compact">
                    <div class="section-heading">
                        <div>
                            <span class="section-kicker">Fontes</span>
                            <h2>Origem do acervo</h2>
                        </div>
                    </div>
                    <div class="sources-list">
                        ${sourcesHtml}
                    </div>
                    <div class="info-callout">
                        <strong>Fluxo recomendado</strong>
                        <p>
                            Importe por URL, revise no modal e salve no banco
                            apenas quando os metadados estiverem consistentes.
                        </p>
                    </div>
                </aside>
            </section>
        </section>
    `;

    document
        .getElementById('home-open-create')
        .addEventListener('click', () => {
            document
                .getElementById('modal-album')
                .classList.remove('hidden');
        });

    document
        .getElementById('home-open-albums')
        .addEventListener('click', renderAlbums);

    document
        .getElementById('home-open-playlists')
        .addEventListener('click', renderPlaylists);

    document
        .querySelectorAll('.recent-item-card')
        .forEach(card => {
            card.addEventListener('click', () => {
                const { type, id } =
                    card.dataset;

                if (type === 'playlist') {
                    localStorage.setItem(
                        'CURRENT_PLAYLIST_ID',
                        id
                    );

                    renderPlaylistPage(id);
                    return;
                }

                localStorage.setItem(
                    'CURRENT_ALBUM_ID',
                    id
                );

                renderAlbumPage(id);
            });
        });
}
