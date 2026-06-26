import {

    openAlbumModal,
    fillAlbumModal,
    showDuplicateWarning,
    clearDuplicateWarning

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

export function openArchiveProfileModal() {

    document
        .getElementById('modal-archive-profile')
        .classList.remove('hidden');
}

export function closeArchiveProfileModal() {

    document
        .getElementById('modal-archive-profile')
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

function renderArchiveProfileResult(result) {
    const container =
        document.getElementById(
            'archive-profile-result'
        );

    const lines = [
        `Encontrados: ${result.found}`,
        `Importados: ${result.imported}`,
        `Pulados: ${result.skipped}`,
        `Falharam: ${result.failed}`
    ];

    if (result.preview) {
        lines.push(`Preview: ${result.preview}`);
    }

    container.innerHTML = `
        <strong>Resumo</strong>
        <br>
        ${lines.join('<br>')}
    `;

    container.classList.remove('hidden');
}

export async function importArchiveProfileBatch() {
    const error =
        document.getElementById(
            'archive-profile-error'
        );

    const resultContainer =
        document.getElementById(
            'archive-profile-result'
        );

    const runButton =
        document.getElementById(
            'btn-import-archive-profile-run'
        );

    error.textContent = '';
    resultContainer.classList.add('hidden');
    resultContainer.innerHTML = '';

    const profileUrl =
        document.getElementById(
            'archive-profile-url'
        ).value.trim();

    const limit =
        document.getElementById(
            'archive-profile-limit'
        ).value;

    const delayMs =
        document.getElementById(
            'archive-profile-delay'
        ).value;

    const dryRun =
        document.getElementById(
            'archive-profile-dry-run'
        ).checked;

    if (!profileUrl) {
        error.textContent =
            'Informe a URL do perfil.';
        return;
    }

    runButton.disabled = true;
    runButton.textContent = 'Importando...';

    try {
        const response =
            await fetch(
                '/api/scrape/archive/profile',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type':
                            'application/json'
                    },
                    body: JSON.stringify({
                        profileUrl,
                        limit,
                        delayMs,
                        dryRun
                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.error ||
                'erro ao importar perfil'
            );
        }

        renderArchiveProfileResult(
            data.result
        );
    } catch (err) {
        error.textContent =
            err.message || 'Erro ao importar perfil';
    } finally {
        runButton.disabled = false;
        runButton.textContent = 'Importar Perfil';
    }
}
