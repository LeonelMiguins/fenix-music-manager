import {
    openMusicModal
}
    from '../../library/modals/addMusicModal.js';

export async function renderPlaylistPage(playlistId) {

    // =========================
    // MAIN
    // =========================

    const main =
        document.getElementById(
            'main-container'
        );

    main.innerHTML =
        '<div class="loading">Carregando playlist...</div>';

    // =========================
    // FETCH
    // =========================

    const response =
        await fetch(
            `/api/playlists/${playlistId}`
        );

    const playlist =
        await response.json();

    // =========================
    // TRACKS HTML
    // =========================

    const tracksHtml =
        playlist.tracks.map((track, index) => `

        <div
            class="playlist-track"
            data-url="${track.url || ''}"
        >

            <span class="track-number">
                ${index + 1}
            </span>

            <span class="track-title">
                ${track.titulo || track.title || 'Sem nome'}  - ${track.artista}
            </span>

        </div>

    `).join('');

    // =========================
    // PAGE
    // =========================

    main.innerHTML = `

    <div class="playlist-page">

        <!-- HEADER -->

        <div class="playlist-header">

            <!-- CAPA -->

            <div class="playlist-header-left">

                <img
                    class="playlist-page-cover"
                    src="${playlist.cover}"
                >

            </div>

            <!-- INFO -->

            <div class="playlist-header-right">

                <div class="playlist-page-info">

                    <h1>
                        ${playlist.titulo}
                    </h1>

                    <h2>
                        Playlist
                    </h2>

                    <p>
                        Gênero:
                        ${playlist.genero || '---'}
                    </p>

                    <p>
                        Ano:
                        ${playlist.ano || '---'}
                    </p>

                    <p>
                        Servidor:
                        ${playlist.servidor || '---'}
                    </p>

                </div>

                <!-- ACTIONS -->

                <div class="playlist-actions">

                    <button
                        class="playlist-action-btn"
                        id="btn-add-music-playlist"
                    >
                        + Adicionar Música
                    </button>

                    <button
                        class="playlist-action-btn danger"
                        id="btn-delete-playlist"
                    >
                        Excluir Playlist
                    </button>

                </div>

            </div>

        </div>

        <!-- TRACKS -->

        <div class="playlist-page-tracks">

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
            '.playlist-track'
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

    // =========================
    // DELETE PLAYLIST
    // =========================

    const deleteBtn =
        document.getElementById(
            'btn-delete-playlist'
        );

    deleteBtn.addEventListener(
        'click',
        async () => {

            const confirmDelete =
                confirm(
                    'Deseja excluir esta playlist?'
                );

            if (!confirmDelete) return;

            const playlistId =
                localStorage.getItem(
                    'CURRENT_PLAYLIST_ID'
                );

            try {

                const response =
                    await fetch(
                        `/api/playlists/${playlistId}`,
                        {
                            method: 'DELETE'
                        }
                    );

                const result =
                    await response.json();

                console.log(result);

                alert(
                    'Playlist excluída!'
                );

                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });

                const { renderPlaylists } =
                    await import('./renderPlaylists.js');

                renderPlaylists();

            } catch (err) {

                console.error(err);

                alert(
                    'Erro ao excluir playlist'
                );

            }

        }
    );

    // =========================
    // ADD MUSIC
    // =========================

    const addMusicBtn =
        document.getElementById(
            'btn-add-music-playlist'
        );

    addMusicBtn.addEventListener(
        'click',
        () => {

            openMusicModal(
                'playlist',
                playlist.id
            );

        }
    );

}
