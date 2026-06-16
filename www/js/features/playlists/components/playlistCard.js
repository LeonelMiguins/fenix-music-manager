export function createPlaylistCard(playlist) {

    const card =
        document.createElement('div');

    card.className =
        'album-card';

    card.innerHTML = `

        <img
            class="album-cover"
            src="${playlist.cover}"
        >

        <div class="album-info">

            <div class="album-title">
                <span class="album-id">playlist</span>
                ${playlist.titulo}
            </div>

            <div class="album-artist">
                ${playlist.artista_nome || 'Curadoria manual'}
            </div>

        </div>

    `;

    return card;
}
