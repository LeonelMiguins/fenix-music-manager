import { getTipoModal, fecharModal } from "./modalController.js";

export async function salvarModal() {
  const tipoModal = getTipoModal();

  if (tipoModal === 'artista') {
    const nome = document.getElementById('nome').value;
    const cover = document.getElementById('cover').value;
    const genero = document.getElementById('genero').value;
    const descricao = document.getElementById('descricao').value;

    await fetch('/api/artistas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, cover, genero, descricao })
    });

    alert("Artista adicionado!");
  }

  if (tipoModal === 'album') {
    const nome = document.getElementById('nome').value;
    const ano = document.getElementById('ano').value;
    const cover = document.getElementById('cover').value;
    const genero = document.getElementById('genero').value;
    const servidor = document.getElementById('servidor').value;
    const artista_id = document.getElementById('artista_id').value;

    await fetch('/api/albuns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, ano, cover, genero, artista_id, servidor })
    });

    alert("Álbum adicionado!");
  }

  if (tipoModal === 'playlists') {
    const nome = document.getElementById('playlist_nome').value;
    const cover = document.getElementById('playlist_cover').value;

    if (!nome) {
      alert("Nome obrigatório");
      return;
    }

    await fetch('/api/playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome,
        cover: cover || null,
        descricao: ""
      })
    });

    alert("Playlist criada!");
  }

  fecharModal();
  window.loadHome();
}