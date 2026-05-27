import { renderPlaylistPage } from '../render/renderPlaylistPage.js';

let CURRENT_TYPE = null;
let CURRENT_ID = null;

// =========================
// OPEN
// =========================

export function openMusicModal(
    type,
    id
) {

    CURRENT_TYPE = type;
    CURRENT_ID = id;

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
                `/api/${CURRENT_TYPE}s/${CURRENT_ID}/music`,
                {

                    method: 'POST',

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

        alert('Música adicionada!');

        closeMusicModal();

        //recarrega a playlis/album mostrando a nova musica adicionada
        renderPlaylistPage(localStorage.getItem('CURRENT_PLAYLIST_ID'));
        //location.reload();

    } catch (err) {

        console.error(err);

        alert(
            'Erro ao adicionar música'
        );
    }
}