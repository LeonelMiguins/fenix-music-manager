//imports
import { renderAlbums } from './render/renderAlbums.js';
import { openAlbumModal, closeAlbumModal, fillAlbumModal, importJsonAlbum, saveAlbum, saveAlbumAsJson} from './modals/modalAlbum.js';
import { openArchiveModal, closeArchiveModal, searchArchiveAlbum } from './modals/archiveImporter.js';
import { openPalcoModal,closePalcoModal,searchPalcoAlbum } from './modals/palcoImporter.js';
import { renderPlaylists } from './render/renderPlaylists.js';
import { saveMusic, closeMusicModal } from './modals/addMusicModal.js';
import {exportDatabaseJson } from './managerDb/exportDb.js';

// exporta o banco de dados para arquivo .json
document .getElementById('export-db-to-json') .addEventListener( 'click',  exportDatabaseJson);

// salvar musica na playlist ou album
document.getElementById('btn-save-music').addEventListener('click', await saveMusic);

// fechar modal de adicionar musica
document.getElementById( 'btn-close-music-modal').addEventListener('click', closeMusicModal);

// botão para salvar album como json
document.getElementById('modal-save-album-btn-json').addEventListener('click', (e) => 
    { e.preventDefault();saveAlbumAsJson();
});

document.getElementById('modal-save-album-btn').addEventListener('click', (e) => {
    e.preventDefault();
    saveAlbum();
});

// botão de abrir modal do scraper do palco mp3
document.getElementById('btn-open-palco').addEventListener('click',openPalcoModal);
document.getElementById('close-palco-modal').addEventListener( 'click', closePalcoModal);
document.getElementById('btn-search-palco').addEventListener('click', searchPalcoAlbum);

//renderiza playlist do db
document.getElementById( 'btn-render-playlists' ).addEventListener('click',renderPlaylists);

document.getElementById('btn-import-archive') .addEventListener( 'click',  openArchiveModal);

document
    .getElementById(
        'close-archive-modal'
    )
    .addEventListener(
        'click',
        closeArchiveModal
    );

document
    .getElementById(
        'btn-search-archive'
    )
    .addEventListener(
        'click',
        searchArchiveAlbum
    );


document
    .getElementById('btn-import-json')
    .addEventListener('click', importJsonAlbum);

const btnRenderAlbums =
    document.getElementById('btn-render-albums');

btnRenderAlbums.addEventListener('click', () => {

    renderAlbums();

});




const dropdowns =
    document.querySelectorAll('.dropdown');

dropdowns.forEach(dropdown => {

    const toggle =
        dropdown.querySelector('.dropdown-toggle');

    const menu =
        dropdown.querySelector('.dropdown-menu');

    toggle.addEventListener('click', (e) => {

        e.stopPropagation();

        // fecha outros dropdowns
        document
            .querySelectorAll('.dropdown-menu')
            .forEach(otherMenu => {

                if (otherMenu !== menu) {
                    otherMenu.classList.remove('show');
                }

            });

        // abre/fecha atual
        menu.classList.toggle('show');

    });

});

// fechar clicando fora
document.addEventListener('click', () => {

    document
        .querySelectorAll('.dropdown-menu')
        .forEach(menu => {

            menu.classList.remove('show');

        });

});


const modal = document.getElementById('modal-album');

document.addEventListener('click', (event) => {

    if ( event.target.id === 'btn-open-album-modal') {

        modal.classList.remove( 'hidden');
    }

    if (
        event.target.id === 'app-modal-close') {

        modal.classList.add(
            'hidden'
        );
    }

});


document.getElementById( 'backup-database') .addEventListener('click',
    async () => {
        try {
            const response =  await fetch('/api/backup-db', { method: 'POST'});
                const result = await response.json();
                console.log(result);
                alert( 'Backup criado!');
            } catch (err) {
                console.log(err);
                alert( 'Erro ao criar backup');
            }
        }
    );