import { renderHome } from './features/home/renderHome.js';
import { renderAlbums } from './features/albums/pages/renderAlbums.js';
import {
    importJsonAlbum,
    saveAlbum,
    saveAlbumAsJson,
    initGenreSelector
} from './features/albums/modals/modalAlbum.js';
import {
    openArchiveModal,
    closeArchiveModal,
    searchArchiveAlbum,
    openArchiveProfileModal,
    closeArchiveProfileModal,
    importArchiveProfileBatch
} from './features/importers/archiveImporter.js';
import {
    openPalcoModal,
    closePalcoModal,
    searchPalcoAlbum
} from './features/importers/palcoImporter.js';
import {
    openJangoModal,
    closeJangoModal,
    copyJangoCaptureScript,
    importJangoCapturedJson,
    fillJangoExample
} from './features/importers/jangoImporter.js';
import { renderPlaylists } from './features/playlists/pages/renderPlaylists.js';
import {
    saveMusic,
    closeMusicModal
} from './features/library/modals/addMusicModal.js';
import {
    exportDatabaseJson,
    openExportModal,
    closeExportModal
} from './features/library/actions/exportDatabaseJson.js';
import { renderSearch } from './features/search/renderSearch.js';

const navigationButtons =
    document.querySelectorAll('[data-view]');

function setActiveView(viewName) {
    navigationButtons.forEach(button => {
        button.classList.toggle(
            'active',
            button.dataset.view === viewName
        );
    });
}

document
    .getElementById('export-db-to-json')
    .addEventListener('click', openExportModal);

document
    .getElementById('close-export-json-modal')
    .addEventListener('click', closeExportModal);

document
    .getElementById('btn-run-export-json')
    .addEventListener('click', exportDatabaseJson);

document
    .getElementById('btn-save-music')
    .addEventListener('click', saveMusic);

document
    .getElementById('btn-close-music-modal')
    .addEventListener('click', closeMusicModal);

document
    .getElementById('modal-save-album-btn-json')
    .addEventListener('click', event => {
        event.preventDefault();
        saveAlbumAsJson();
    });

document
    .getElementById('modal-save-album-btn')
    .addEventListener('click', event => {
        event.preventDefault();
        saveAlbum();
    });

document
    .getElementById('btn-render-home')
    .addEventListener('click', () => {
        setActiveView('home');
        renderHome();
    });

document
    .getElementById('btn-render-albums')
    .addEventListener('click', () => {
        setActiveView('albums');
        renderAlbums();
    });

document
    .getElementById('btn-render-playlists')
    .addEventListener('click', () => {
        setActiveView('playlists');
        renderPlaylists();
    });

document
    .getElementById('btn-open-palco')
    .addEventListener('click', openPalcoModal);

document
    .getElementById('btn-open-jango')
    .addEventListener('click', openJangoModal);

document
    .getElementById('close-palco-modal')
    .addEventListener('click', closePalcoModal);

document
    .getElementById('close-jango-modal')
    .addEventListener('click', closeJangoModal);

document
    .getElementById('btn-search-palco')
    .addEventListener('click', searchPalcoAlbum);

document
    .getElementById('btn-copy-jango-script')
    .addEventListener('click', copyJangoCaptureScript);

document
    .getElementById('btn-import-jango-json')
    .addEventListener('click', importJangoCapturedJson);

document
    .getElementById('btn-fill-jango-example')
    .addEventListener('click', fillJangoExample);

document
    .getElementById('btn-import-archive')
    .addEventListener('click', openArchiveModal);

document
    .getElementById('btn-import-archive-profile')
    .addEventListener('click', openArchiveProfileModal);

document
    .getElementById('close-archive-modal')
    .addEventListener('click', closeArchiveModal);

document
    .getElementById('close-archive-profile-modal')
    .addEventListener('click', closeArchiveProfileModal);

document
    .getElementById('btn-search-archive')
    .addEventListener('click', searchArchiveAlbum);

document
    .getElementById('btn-import-archive-profile-run')
    .addEventListener('click', importArchiveProfileBatch);

document
    .getElementById('btn-import-json')
    .addEventListener('click', importJsonAlbum);

const dropdowns =
    document.querySelectorAll('.dropdown');

dropdowns.forEach(dropdown => {
    const toggle =
        dropdown.querySelector('.dropdown-toggle');

    const menu =
        dropdown.querySelector('.dropdown-menu');

    toggle.addEventListener('click', event => {
        event.stopPropagation();

        document
            .querySelectorAll('.dropdown-menu')
            .forEach(otherMenu => {
                if (otherMenu !== menu) {
                    otherMenu.classList.remove('show');
                }
            });

        menu.classList.toggle('show');
    });
});

document.addEventListener('click', () => {
    document
        .querySelectorAll('.dropdown-menu')
        .forEach(menu => {
            menu.classList.remove('show');
        });
});

const modal =
    document.getElementById(
        'modal-album'
    );

document.addEventListener('click', event => {
    if (event.target.id === 'btn-open-album-modal') {
        modal.classList.remove('hidden');
    }

    if (event.target.id === 'app-modal-close') {
        modal.classList.add('hidden');
    }
});

document
    .getElementById('backup-database')
    .addEventListener('click', async () => {
        try {
            const response =
                await fetch('/api/backup-db', {
                    method: 'POST'
                });

            const result =
                await response.json();

            console.log(result);
            alert('Backup criado!');
        } catch (err) {
            console.log(err);
            alert('Erro ao criar backup');
        }
    });

document
    .getElementById('btn-search')
    .addEventListener('click', () => {
        const query =
            document.getElementById('search-input').value.trim();

        if (!query) {
            return;
        }

        setActiveView(null);
        renderSearch(query);
    });

document
    .getElementById('search-input')
    .addEventListener('keydown', event => {
        if (event.key !== 'Enter') {
            return;
        }

        const query =
            event.currentTarget.value.trim();

        if (!query) {
            return;
        }

        setActiveView(null);
        renderSearch(query);
    });

renderHome();
initGenreSelector();
