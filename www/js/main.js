import { loadAlbum } from './albumView.js';
import { loadArtista } from './artistView.js';
import { loadPlaylists, loadPlaylistMusicas } from './playlistView.js';

import { exportDb } from "./utils/exportDb.js";

import { abrirModal, fecharModal } from "./modals/modalController.js";
import { salvarModal } from "./modals/modalActions.js";

import { openAddMusicModal, closeAddMusicModal, saveMusic } from "./modals/addMusicModal.js";

window.openAddMusicModal = openAddMusicModal;
window.closeAddMusicModal = closeAddMusicModal;
window.saveMusic = saveMusic;

// =========================
// GLOBALS (necessário pro HTML onclick)
// =========================
window.abrirModal = abrirModal;
window.fecharModal = fecharModal;
window.salvarModal = salvarModal;

window.loadAlbum = loadAlbum;
window.loadArtista = loadArtista;
window.loadPlaylists = loadPlaylists;
window.loadPlaylistMusicas = loadPlaylistMusicas;

// =========================
// APP ROOT
// =========================
const app = document.getElementById('app');

let cache = [];

// =========================
// LOAD INICIAL
// =========================
loadHome();

export async function loadHome() {
    const res = await fetch('/api/artistas');
    const data = await res.json();

    cache = data;
    render(data);
}

window.loadHome = loadHome;

// =========================
// RENDER HOME
// =========================
function render(lista) {
    app.innerHTML = `<div class="home-grid"></div>`;
    const grid = app.querySelector('.home-grid');

    lista.forEach(item => {
        const div = document.createElement('div');
        div.className = 'card';

        div.innerHTML = `
            <img src="${item.cover || ''}">
            <div class="card-title">${item.nome}</div>
            <div>ID: ${item.id || ''}</div>
            <div>${item.genero || ''}</div>
            <button class="delete-btn" data-id="${item.id}">
                🗑 Deletar
            </button>
        `;

        div.onclick = (e) => {
            if (e.target.classList.contains('delete-btn')) return;

            localStorage.setItem("CURRENT_ARTIST_ID", item.id);
            loadArtista(item.id);
        };

        grid.appendChild(div);
    });
}

// =========================
// FILTRO
// =========================
function filtrar() {
    const termo = document.getElementById('search').value.toLowerCase();

    const filtrados = cache.filter(a =>
        a.nome.toLowerCase().includes(termo)
    );

    render(filtrados);
}

window.filtrar = filtrar;

// =========================
// DELETE ARTISTA
// =========================
document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-btn')) {
        const id = e.target.dataset.id;

        const confirmacao = confirm("Tem certeza que deseja deletar este artista?");
        if (!confirmacao) return;

        await fetch(`/api/artistas/${id}`, {
            method: 'DELETE'
        });

        console.log('Artista deletado!');
        loadHome();
    }
});

document.getElementById("export-db-btn").onclick = async () => {
    const confirmacao = confirm("Tem certeza que deseja exportar o banco de dados?");
    if (!confirmacao) return;

    await exportDb();
};