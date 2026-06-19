// =========================
// ABRIR MODAL
// =========================

export function openAlbumModal() {

    document
        .getElementById('modal-album')
        .classList.remove('hidden');
}

// =========================
// FECHAR MODAL
// =========================

export function closeAlbumModal() {

    document
        .getElementById('modal-album')
        .classList.add('hidden');
}

// =========================
// SALVAR ÁLBUM
// =========================

export async function saveAlbum() {

    // =========================
    // TRACKS
    // =========================

    const tracks = [];

    const trackElements =
        document.querySelectorAll('.track-item');

    trackElements.forEach(trackEl => {

        tracks.push({

            title:
                trackEl.dataset.title || '',

            artist:
                trackEl.dataset.artist || '',

            url:
                trackEl.dataset.url || ''

        });

    });



    // =========================
    // ALBUM
    // =========================

    // pega antes de salvar se e album ou playlist
    const selectedType = document.querySelector('.album-type-btn.active').dataset.type;

    const album = {

        type: selectedType,

        album:
            document.getElementById(
                'modal-album-titulo'
            ).value,

        artist:
            document.getElementById(
                'modal-album-artista'
            ).value,

        related:
            document.getElementById(
                'modal-album-relacionado'
            ).value,

        year:
            document.getElementById(
                'modal-album-ano'
            ).value,

        genrer:
            document.getElementById(
                'modal-album-genero'
            ).value,

        cover:
            document.getElementById(
                'modal-album-cover'
            ).value,

        server:
            document.getElementById(
                'modal-album-servidor'
            ).value,

        author:
            document.getElementById(
                'modal-album-autor'
            ).value,

        tracks
    };

    console.log('ALBUM:', album);

    // =========================
    // ENVIAR
    // =========================

    try {

        const response =
            await fetch('/api/albums', {

                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(album)
            });

        const result =
            await response.json();

        console.log(result);

        alert(selectedType+' salvo!');

        closeAlbumModal();

    } catch (err) {

        console.error(err);

        alert('Erro ao salvar álbum');
    }
}

// =========================
// PREENCHER MODAL
// =========================

export function fillAlbumModal(album) {

    // =========================
    // INPUTS
    // =========================

    document
        .getElementById('modal-album-cover')
        .value = album.cover || '';

    document
        .getElementById('modal-album-titulo')
        .value = album.album || '';

    document
        .getElementById('modal-album-artista')
        .value = album.artist || '';

    document
        .getElementById('modal-album-relacionado')
        .value = album.related || '';

    document
        .getElementById('modal-album-genero')
        .value = album.genrer || '';

    document
        .getElementById('modal-album-servidor')
        .value = album.server || '';

    document
        .getElementById('modal-album-autor')
        .value = album.author || '';

    document
        .getElementById('modal-album-ano')
        .value = album.year || '';


    // seleciona automaticamente o botão playlist / album
    const albumType = album.type || 'album';

    const typeButtons = document.querySelectorAll( '.album-type-btn');
        typeButtons.forEach(btn => { btn.classList.remove( 'active');
            if ( btn.dataset.type === albumType) {
               btn.classList.add( 'active' );
        }

    });

    // =========================
    // CAPA
    // =========================

    document
        .getElementById('modal-preview-cover')
        .src =
        album.cover ||
        'https://placehold.co/400x400';

    // =========================
    // TRACKS
    // =========================

    const tracksContainer =
        document.getElementById(
            'modal-track-list'
        );

    tracksContainer.innerHTML = '';

    if (!album.tracks) return;

    album.tracks.forEach((track, index) => {

        const div =
            document.createElement('div');

        div.className = 'track-item';

        // IMPORTANTEEEE
        // ISSO QUE SALVA AS DATAS
        // NOS ELEMENTOS HTML

        div.dataset.title =
            track.title || '';

        div.dataset.artist =
            track.artist || '';

        div.dataset.url =
            track.url || '';

        div.innerHTML = `
            ${index + 1} • ${track.title}${track.artist ? ` - ${track.artist}` : ''}
        `;

        tracksContainer.appendChild(div);
    });
}

// =========================
// IMPORTAR JSON
// =========================

export async function importJsonAlbum() {

    const input =
        document.createElement('input');

    input.type = 'file';

    input.accept = '.json';

    input.onchange = async (event) => {

        const file =
            event.target.files[0];

        if (!file) return;

        const text =
            await file.text();

        const album =
            JSON.parse(text);

        console.log(album);

        // abre modal

        openAlbumModal();

        // preenche modal

        fillAlbumModal(album);
    };

    input.click();
}

// =========================
// SALVAR COMO JSON
// =========================

export async function saveAlbumAsJson() {

    // =========================
    // TRACKS
    // =========================

    const tracks = [];

    const trackElements =
        document.querySelectorAll('.track-item');

    trackElements.forEach(trackEl => {

        tracks.push({

            title:
                trackEl.dataset.title || '',

            artist:
                trackEl.dataset.artist || '',

            url:
                trackEl.dataset.url || ''

        });

    });

    // =========================
    // ALBUM
    // =========================

    // =========================
    // TYPE
    // =========================

    const activeTypeButton =
        document.querySelector(
            '.album-type-btn.active'
        );

    const albumType =
        activeTypeButton
            ? activeTypeButton.dataset.type
            : 'album';
    console.log(albumType)

    const album = {

        album:
            document.getElementById(
                'modal-album-titulo'
            ).value,

        artist:
            document.getElementById(
                'modal-album-artista'
            ).value,

        related:
            document.getElementById(
                'modal-album-relacionado'
            ).value,

        year:
            document.getElementById(
                'modal-album-ano'
            ).value,

        genrer:
            document.getElementById(
                'modal-album-genero'
            ).value,

        cover:
            document.getElementById(
                'modal-album-cover'
            ).value,

        server:
            document.getElementById(
                'modal-album-servidor'
            ).value,

        author:
            document.getElementById(
                'modal-album-autor'
            ).value,

        type:
            albumType,

        tracks
    };

    try {

        // =========================
        // ESCOLHER PASTA
        // =========================

        const dirHandle =
            await window.showDirectoryPicker();

        // nome arquivo

        const fileName =
            `${album.album} - ${album.artist}.json`;

        // cria arquivo

        const fileHandle =
            await dirHandle.getFileHandle(
                fileName,
                { create: true }
            );

        // escreve

        const writable =
            await fileHandle.createWritable();

        await writable.write(
            JSON.stringify(album, null, 2)
        );

        await writable.close();

        alert(albumType+' salvo com sucesso!');

    } catch (err) {

        console.error(err);

        alert('Erro ao salvar JSON');
    }
}


// =========================
// TYPE SELECTOR
// =========================

const typeButtons =
    document.querySelectorAll(
        '.album-type-btn'
    );

typeButtons.forEach(btn => {

    btn.addEventListener('click', () => {

        typeButtons.forEach(b => {

            b.classList.remove(
                'active'
            );

        });

        btn.classList.add(
            'active'
        );

    });

});
