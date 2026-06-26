import { renderAlbumPage } from '../../albums/pages/renderAlbumPage.js';
import { renderPlaylistPage } from '../../playlists/pages/renderPlaylistPage.js';

let CURRENT_TYPE = null;
let CURRENT_ID = null;
let CURRENT_MODE = 'create';
let CURRENT_TRACK_ID = null;

function getMusicModalTitle() {
    return document.getElementById(
        'add-music-modal-title'
    );
}

function getMusicSaveButton() {
    return document.getElementById(
        'btn-save-music'
    );
}

function fillMusicForm(music = {}) {
    document.getElementById(
        'add-music-title'
    ).value = music.title || music.titulo || '';

    document.getElementById(
        'add-music-artist'
    ).value = music.artist || music.artista || '';

    document.getElementById(
        'add-music-url'
    ).value = music.url || '';

    document.getElementById(
        'add-music-cover'
    ).value = music.cover || '';
}

function resetMusicModalState() {
    CURRENT_MODE = 'create';
    CURRENT_TRACK_ID = null;

    getMusicModalTitle().textContent =
        'Adicionar Música';

    getMusicSaveButton().textContent =
        'Salvar';

    fillMusicForm();
}

// =========================
// OPEN
// =========================

export function openMusicModal(
    type,
    id
) {

    CURRENT_TYPE = type;
    CURRENT_ID = id;
    CURRENT_MODE = 'create';
    CURRENT_TRACK_ID = null;

    getMusicModalTitle().textContent =
        'Adicionar Música';

    getMusicSaveButton().textContent =
        'Salvar';

    fillMusicForm();

    document
        .getElementById(
            'modal-add-music'
        )
        .classList.remove(
            'hidden'
        );
}

export function openEditMusicModal(
    type,
    id,
    music
) {
    CURRENT_TYPE = type;
    CURRENT_ID = id;
    CURRENT_MODE = 'edit';
    CURRENT_TRACK_ID = music.id;

    getMusicModalTitle().textContent =
        'Editar Música';

    getMusicSaveButton().textContent =
        'Salvar Alteracoes';

    fillMusicForm(music);

    document
        .getElementById(
            'modal-add-music'
        )
        .classList.remove(
            'hidden'
        );
}

// =========================
// CLOSE
// =========================

export function closeMusicModal() {

    document
        .getElementById(
            'modal-add-music'
        )
        .classList.add(
            'hidden'
        );

    resetMusicModalState();
}

// =========================
// SAVE
// =========================

export async function saveMusic() {

    const music = {

        title:
            document.getElementById(
                'add-music-title'
            ).value,

        artist:
            document.getElementById(
                'add-music-artist'
            ).value,

        url:
            document.getElementById(
                'add-music-url'
            ).value,

        cover:
            document.getElementById(
                'add-music-cover'
            ).value
    };

    try {

        const response =
            await fetch(
                CURRENT_MODE === 'edit'
                    ? `/api/${CURRENT_TYPE}s/${CURRENT_ID}/music/${CURRENT_TRACK_ID}`
                    : `/api/${CURRENT_TYPE}s/${CURRENT_ID}/music`,
                {

                    method:
                        CURRENT_MODE === 'edit'
                            ? 'PUT'
                            : 'POST',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body:
                        JSON.stringify(
                            music
                        )
                }
            );

        const result =
            await response.json();

        console.log(result);

        alert(
            CURRENT_MODE === 'edit'
                ? 'Música atualizada!'
                : 'Música adicionada!'
        );

        closeMusicModal();

        if (CURRENT_TYPE === 'album') {
            renderAlbumPage(CURRENT_ID);
        } else {
            renderPlaylistPage(CURRENT_ID);
        }

    } catch (err) {

        console.error(err);

        alert(
            'Erro ao adicionar música'
        );
    }
}
