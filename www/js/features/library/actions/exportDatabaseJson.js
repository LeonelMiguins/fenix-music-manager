export function openExportModal() {

    document
        .getElementById('modal-export-json')
        .classList.remove('hidden');
}

export function closeExportModal() {

    document
        .getElementById('modal-export-json')
        .classList.add('hidden');
}

export async function exportDatabaseJson() {
    const includeAlbums =
        document.getElementById(
            'export-include-albums'
        ).checked;

    const includePlaylists =
        document.getElementById(
            'export-include-playlists'
        ).checked;

    const fields = {
        related:
            document.getElementById('export-field-related').checked,
        year:
            document.getElementById('export-field-year').checked,
        genrer:
            document.getElementById('export-field-genrer').checked,
        description:
            document.getElementById('export-field-description').checked,
        cover:
            document.getElementById('export-field-cover').checked,
        server:
            document.getElementById('export-field-server').checked,
        author:
            document.getElementById('export-field-author').checked,
        savedAt:
            document.getElementById('export-field-savedat').checked,
        sourceUrl:
            document.getElementById('export-field-sourceurl').checked,
        origin:
            document.getElementById('export-field-origin').checked
    };

    const error =
        document.getElementById(
            'export-json-error'
        );

    const button =
        document.getElementById(
            'btn-run-export-json'
        );

    error.textContent = '';

    if (!includeAlbums && !includePlaylists) {
        error.textContent =
            'Selecione pelo menos uma opcao.';
        return;
    }

    button.disabled = true;
    button.textContent = 'Exportando...';

    try {
        const response =
            await fetch(
                '/api/export/songs-json',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type':
                            'application/json'
                    },
                    body: JSON.stringify({
                        includeAlbums,
                        includePlaylists,
                        fields
                    })
                }
            );

        if (!response.ok) {
            throw new Error(
                'Erro ao exportar songs.json'
            );
        }

        const blob =
            await response.blob();

        const url =
            window.URL.createObjectURL(blob);

        const link =
            document.createElement('a');

        link.href = url;
        link.download = 'songs.json';
        link.click();

        window.URL.revokeObjectURL(url);

        closeExportModal();
    } catch (err) {
        error.textContent =
            err.message || 'Erro ao exportar';
    } finally {
        button.disabled = false;
        button.textContent = 'Exportar';
    }
}
