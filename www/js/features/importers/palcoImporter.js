import {

    openAlbumModal,
    fillAlbumModal,
    showDuplicateWarning,
    clearDuplicateWarning

} from '../albums/modals/modalAlbum.js';

// =========================
// OPEN
// =========================

export function openPalcoModal() {

    document
        .getElementById('modal-palco')
        .classList.remove('hidden');
}

// =========================
// CLOSE
// =========================

export function closePalcoModal() {

    document
        .getElementById('modal-palco')
        .classList.add('hidden');
}

// =========================
// SEARCH
// =========================

export async function searchPalcoAlbum() {

    const error =
        document.getElementById(
            'palco-error'
        );

    error.textContent = '';

    const url =
        document.getElementById(
            'palco-url'
        ).value;

    const response =
        await fetch(
            '/api/scrape/palco',
            {

                method: 'POST',

                headers: {

                    'Content-Type':
                        'application/json'
                },

                body: JSON.stringify({
                    url
                })
            }
        );

    const data =
        await response.json();

    // =========================
    // ERROR
    // =========================

    if (!data.success) {

        error.textContent =
            'Álbum não encontrado';

        error.style.color =
            'red';

        return;
    }
    // =========================
    // SUCCESS
    // =========================

    closePalcoModal();

    if (data.duplicate) {
        showDuplicateWarning(
            data.existing
        );
    } else {
        clearDuplicateWarning();
    }

    openAlbumModal();

    fillAlbumModal(
        data.album
    );
}
