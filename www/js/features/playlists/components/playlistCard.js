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
                ${playlist.titulo}
            </div>

            <div class="album-artist">
                Playlist
            </div>

        </div>

    `;

    return card;
}