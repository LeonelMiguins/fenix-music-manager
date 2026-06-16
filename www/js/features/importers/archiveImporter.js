import {

    openAlbumModal,
    fillAlbumModal

} from '../albums/modals/modalAlbum.js';

// =========================
// OPEN MODAL
// =========================

export function openArchiveModal() {

    document
        .getElementById('modal-archive')
        .classList.remove('hidden');
}

// =========================
// CLOSE MODAL
// =========================

export function closeArchiveModal() {

    document
        .getElementById('modal-archive')
        .classList.add('hidden');
}

// =========================
// SEARCH
// =========================

export async function searchArchiveAlbum() {

    const error =
        document.getElementById(
            'archive-error'
        );

    error.textContent = '';

    const url =
        document.getElementById(
            'archive-url'
        ).value;

    const response =
        await fetch(
            '/api/scrape/archive',
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
    // ERRO
    // =========================

    if (!data.success) {

        error.textContent =
            'Álbum não encontrado';

        return;
    }

    // =========================
    // SUCESSO
    // =========================

    closeArchiveModal();

    openAlbumModal();

    fillAlbumModal(
        data.album
    );
}
