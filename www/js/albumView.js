const app = document.getElementById('app');

let currentAudio = null;

/* =========================
   🔥 LOAD ÁLBUM
========================= */
export async function loadAlbum(id) {
    localStorage.setItem("CURRENT_ALBUM_ID", id)
    const [resAlbum, resMusicas] = await Promise.all([
        fetch(`/api/albuns/${id}`),
        fetch(`/api/musicas/album/${id}`)
    ]);

    const album = await resAlbum.json();
    const musicas = await resMusicas.json();

    renderAlbum(album, musicas);
}


window.loadAlbum = loadAlbum;

/* =========================
   🎨 RENDER
========================= */
function renderAlbum(album, musicas) {
    app.innerHTML = `
        <div class="album-header">

            <button class="back-btn" onclick="loadHome()">⬅ Voltar</button>

            <div class="album-info">
                <img class="album-cover" src="${album.cover}" />

                <div class="album-text">
                    <h2>${album.nome}</h2>
                    <p>${album.genero || ''}</p>
                    <p>${album.servidor || ''}</p>

                    <!-- 🔥 BOTÃO NOVO -->
                    <button onclick="openAddMusicModal()">+ Adicionar Música</button>
                </div>
            </div>
        </div>

        <hr>

        <h3>Músicas</h3>

        <div class="music-grid">
            ${musicas.map((m, index) => `
                <div class="music-card" onclick="playMusic(${index}, '${m.url}')">
                    <div class="music-title">${m.nome}</div>
                </div>
            `).join('')}
        </div>
    `;
}

/* =========================
   🎧 PLAYER GLOBAL
========================= */
function playMusic(index, url) {
    let audio = document.getElementById(`audio-${index}`);

    // cria áudio se ainda não existe
    if (!audio) {
        audio = new Audio(url);
        audio.id = `audio-${index}`;
        document.body.appendChild(audio);
    }

    // se clicar em outra música, pausa a atual
    if (currentAudio && currentAudio !== audio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    // toggle play/pause
    if (audio.paused) {
        audio.play();
        currentAudio = audio;
    } else {
        audio.pause();
        currentAudio = null;
    }
}

window.playMusic = playMusic;