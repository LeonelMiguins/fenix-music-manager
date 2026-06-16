export function createAlbumCard(album) {

    const card =
        document.createElement('div');

    card.className =
        'album-card';

    // salva id no elemento

    card.dataset.id =
        album.id;

    card.innerHTML = `
    
        <img
            class="album-cover"
            src="${album.cover}"
            alt="${album.titulo}"
        >

        <div class="album-info">

            <div class="album-title">
                <span class="album-id">id: ${album.id}</span> ${album.titulo}  
            </div>

            <div class="album-artist">
                ${album.artista_nome}
            </div>

        </div>
    `;

    return card;
}