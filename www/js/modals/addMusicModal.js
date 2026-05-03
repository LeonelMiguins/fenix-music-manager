export function openAddMusicModal() {
    document.getElementById('add-music-modal').style.display = 'flex';
}

export function closeAddMusicModal() {
    document.getElementById('add-music-modal').style.display = 'none';
}

export async function saveMusic() {
    const nome = document.getElementById('music-name').value;
    const url = document.getElementById('music-url').value;
    const cover = document.getElementById('music-cover').value;

    const albumId = localStorage.getItem("CURRENT_ALBUM_ID");

    if (!albumId) {
        alert("Nenhum álbum selecionado");
        return;
    }

    await fetch('/api/musicas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            nome,
            url,
            album_id: albumId,
            cover
        })
    });

    alert("Música adicionada ao album - "+albumId);
    console("Música adicionada ao album - "+albumId)

    closeAddMusicModal();

    // 🔥 IMPORTANTE: precisa estar global
    window.loadAlbum(albumId);
}