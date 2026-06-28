import {
    openMusicModal
}
from '../../library/modals/addMusicModal.js';
import {
    openEditMusicModal
}
from '../../library/modals/addMusicModal.js';
import {
    openAlbumEditModal
}
from '../modals/modalAlbum.js';
import { navigateToAlbums } from '../../../navigation.js';

function inferAlbumSourceUrl(album) {
    if (album.source_url) {
        return album.source_url;
    }

    if (album.sourceUrl) {
        return album.sourceUrl;
    }

    if (album.servidor !== 'internet-archive') {
        return '';
    }

    const possibleSources = [
        album.cover,
        ...(album.tracks || []).map(track => track.url)
    ].filter(Boolean);

    for (const source of possibleSources) {
        const match =
            String(source).match(
                /archive\.org\/(?:download|services\/img|[^/]+\/\d+\/items)\/([^/?#]+)|archive\.org\/([^/?#]+)\/([^/?#]+)/
            );

        const itemId =
            match?.[1] ||
            match?.[3] ||
            '';

        if (itemId) {
            return `https://archive.org/details/${itemId}`;
        }
    }

    return '';
}

export async function renderAlbumPage(albumId) {

    // =========================
    // MAIN
    // =========================

    const main =
        document.getElementById(
            'main-container'
        );

    main.innerHTML =
        '<div class="loading">Carregando álbum...</div>';

    // =========================
    // FETCH
    // =========================

    const response =
        await fetch(
            `/api/albums/${albumId}`
        );

    const album =
        await response.json();

    const sourceUrl =
        inferAlbumSourceUrl(album);

    // =========================
    // TRACKS HTML
    // =========================

    const tracksHtml =
        album.tracks.map((track, index) => `

            <div
                class="album-track"
                data-url="${track.url}"
                data-track-id="${track.id || ''}"
            >

                <div class="track-main-content">
                    <span class="track-number">
                        ${index + 1}
                    </span>

                    <span class="track-title">
                        ${track.titulo || track.title || 'Faixa sem titulo'} - ${track.artista || album.artista_nome}
                    </span>
                </div>

                <button
                    type="button"
                    class="track-edit-btn"
                    data-edit-track="${track.id || ''}"
                >
                    Editar
                </button>

            </div>

        `).join('');

    const sourceLinkHtml =
        sourceUrl
            ? `
                <p class="album-source-line">
                    Origem:
                    <a
                        class="album-source-link"
                        href="${sourceUrl}"
                        target="_blank"
                        rel="noreferrer"
                    >
                        ${sourceUrl}
                    </a>
                </p>
            `
            : `
                <p class="album-source-line">
                    Origem:
                    ---
                </p>
            `;

    // =========================
    // PAGE
    // =========================

    main.innerHTML = `

    <div class="album-page">

        <!-- HEADER -->

        <div class="album-header">

            <!-- CAPA -->

            <div class="album-header-left">

                <img
                    class="album-page-cover"
                    src="${album.cover}"
                >

            </div>

            <!-- INFO -->

            <div class="album-header-right">

                <div class="album-page-info">

                    <h1>
                        ${album.titulo}
                    </h1>

                    <h2>
                        ${album.artista_nome}
                    </h2>

                    <p>
                        Gênero:
                        ${album.genero || '---'}
                    </p>

                    <p>
                        Ano:
                        ${album.ano || '---'}
                    </p>

                    <p>
                        Servidor:
                        ${album.servidor || '---'}
                    </p>

                    ${sourceLinkHtml}

                </div>

                <!-- ACTIONS -->

                <div class="album-actions">

                    <button
                        id="btn-edit-album" class="album-action-btn"
                    >
                        Editar Álbum
                    </button>

                    <button
                        id="btn-add-music-album" class="album-action-btn"
                    >
                        + Adicionar Música
                    </button>

                    <button
                        class="album-action-btn danger"
                        id="btn-delete-album"
                    >
                        Excluir Álbum
                    </button>

                </div>

            </div>

        </div>

        <!-- TRACKS -->

        <div class="album-page-tracks">

            <h3>
                Músicas
            </h3>

            ${tracksHtml}

        </div>

    </div>
`;

    // =========================
    // PLAYER GLOBAL
    // =========================

    const player =
        document.getElementById(
            'album-audio-player'
        );

    // =========================
    // TRACK CLICK
    // =========================

    const trackElements =
        document.querySelectorAll(
            '.album-track'
        );

    trackElements.forEach(trackEl => {

        trackEl.addEventListener(
            'click',
            () => {

                // remove ativo

                trackElements.forEach(el => {

                    el.classList.remove(
                        'active-track'
                    );

                });

                // adiciona ativo

                trackEl.classList.add(
                    'active-track'
                );

                // toca

                player.src =
                    trackEl.dataset.url;

                player.play();

            }
        );

    });

    document
        .querySelectorAll('[data-edit-track]')
        .forEach(button => {
            button.addEventListener(
                'click',
                event => {
                    event.stopPropagation();

                    const trackId =
                        Number(
                            button.dataset.editTrack
                        );

                    const track =
                        album.tracks.find(item =>
                            Number(item.id) === trackId
                        );

                    if (!track) {
                        return;
                    }

                    openEditMusicModal(
                        'album',
                        album.id,
                        {
                            ...track,
                            artist:
                                track.artista || track.artist || album.artista_nome || ''
                        }
                    );
                }
            );
        });


// =========================
// DELETE ALBUM
// =========================

const deleteBtn =
    document.getElementById(
        'btn-delete-album'
    );

deleteBtn.addEventListener(
    'click',
    async () => {

        const confirmDelete =
            confirm(
                'Deseja excluir este álbum?'
            );

        if (!confirmDelete) return;

        const albumId =
            localStorage.getItem(
                'CURRENT_ALBUM_ID'
            );

        try {

            const response =
                await fetch(
                    `/api/albums/${albumId}`,
                    {
                        method: 'DELETE'
                    }
                );

            const result =
                await response.json();

            console.log(result);

            alert('Álbum excluído!');

            // volta para lista

            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });

            navigateToAlbums({
                replace: true
            });

        } catch (err) {

            console.error(err);

            alert(
                'Erro ao excluir álbum'
            );
        }

    }

    
);

const editBtn =
    document.getElementById(
        'btn-edit-album'
    );

editBtn.addEventListener(
    'click',
    () => {
        openAlbumEditModal(album);
    }
);


const addMusicBtn =
    document.getElementById(
        'btn-add-music-album'
    );

addMusicBtn.addEventListener(
    'click',
    () => {

        openMusicModal(
            'album',
            album.id
        );

    }
);

}
