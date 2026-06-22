let availableGenres = [];
let selectedGenres = [];
let genreSelectorInitialized = false;

function normalizeGenreText(value = '') {
    return String(value)
        .trim()
        .replace(/\s+/g, ' ');
}

function parseGenres(value) {
    if (Array.isArray(value)) {
        return value
            .map(normalizeGenreText)
            .filter(Boolean);
    }

    if (!value) {
        return [];
    }

    const normalizedValue =
        String(value).trim();

    if (!normalizedValue) {
        return [];
    }

    if (
        normalizedValue.startsWith('[') &&
        normalizedValue.endsWith(']')
    ) {
        try {
            const parsed =
                JSON.parse(normalizedValue);

            if (Array.isArray(parsed)) {
                return parsed
                    .map(normalizeGenreText)
                    .filter(Boolean);
            }
        } catch {
            // fallback abaixo
        }
    }

    return normalizedValue
        .split(',')
        .map(normalizeGenreText)
        .filter(Boolean);
}

function ensureGenresExist(genres) {
    genres.forEach(genre => {
        if (!availableGenres.includes(genre)) {
            availableGenres.push(genre);
        }
    });

    availableGenres.sort((left, right) =>
        left.localeCompare(right, 'pt-BR')
    );
}

function syncGenreInput() {
    document
        .getElementById('modal-album-genero')
        .value = selectedGenres.join(', ');
}

function renderSelectedGenres() {
    const container =
        document.getElementById(
            'modal-genre-selected'
        );

    if (!container) {
        return;
    }

    if (selectedGenres.length === 0) {
        container.innerHTML = `
            <span class="genre-empty-state">
                Nenhum genero selecionado.
            </span>
        `;
        return;
    }

    container.innerHTML =
        selectedGenres.map(genre => `
            <span class="genre-tag">
                ${genre}
                <button
                    type="button"
                    class="genre-tag-remove"
                    data-remove-genre="${genre}"
                    aria-label="Remover ${genre}"
                >
                    ×
                </button>
            </span>
        `).join('');

    container
        .querySelectorAll('[data-remove-genre]')
        .forEach(button => {
            button.addEventListener('click', () => {
                toggleGenreSelection(
                    button.dataset.removeGenre
                );
            });
        });
}

function renderGenreOptions(filterText = '') {
    const container =
        document.getElementById(
            'modal-genre-options'
        );

    if (!container) {
        return;
    }

    const normalizedFilter =
        normalizeGenreText(filterText).toLowerCase();

    const genresToShow =
        availableGenres.filter(genre => {
            if (!normalizedFilter) {
                return true;
            }

            return genre
                .toLowerCase()
                .includes(normalizedFilter);
        });

    if (genresToShow.length === 0) {
        container.innerHTML = `
            <span class="genre-empty-state">
                Nenhum genero encontrado.
            </span>
        `;
        return;
    }

    container.innerHTML =
        genresToShow.map(genre => `
            <button
                type="button"
                class="genre-option-btn ${selectedGenres.includes(genre) ? 'active' : ''}"
                data-genre-option="${genre}"
            >
                ${genre}
            </button>
        `).join('');

    container
        .querySelectorAll('[data-genre-option]')
        .forEach(button => {
            button.addEventListener('click', () => {
                toggleGenreSelection(
                    button.dataset.genreOption
                );
            });
        });
}

function updateGenreUi(filterText = '') {
    syncGenreInput();
    renderSelectedGenres();
    renderGenreOptions(filterText);
}

function setSelectedGenres(genres) {
    selectedGenres = Array.from(
        new Set(
            genres
                .map(normalizeGenreText)
                .filter(Boolean)
        )
    );

    ensureGenresExist(selectedGenres);
    updateGenreUi(
        document.getElementById('modal-genre-search')?.value || ''
    );
}

function toggleGenreSelection(genre) {
    if (!genre) {
        return;
    }

    if (selectedGenres.includes(genre)) {
        selectedGenres =
            selectedGenres.filter(item => item !== genre);
    } else {
        selectedGenres = [
            ...selectedGenres,
            genre
        ];
    }

    updateGenreUi(
        document.getElementById('modal-genre-search')?.value || ''
    );
}

async function loadGenres() {
    const response =
        await fetch('/data/genres.json');

    if (!response.ok) {
        throw new Error('Erro ao carregar generos');
    }

    const data =
        await response.json();

    const genres =
        Array.isArray(data)
            ? data
            : data.genres;

    availableGenres = (genres || [])
        .map(normalizeGenreText)
        .filter(Boolean)
        .sort((left, right) =>
            left.localeCompare(right, 'pt-BR')
        );

    updateGenreUi();
}

export async function initGenreSelector() {
    if (genreSelectorInitialized) {
        return;
    }

    genreSelectorInitialized = true;

    const searchInput =
        document.getElementById(
            'modal-genre-search'
        );

    searchInput.addEventListener('input', event => {
        renderGenreOptions(
            event.currentTarget.value
        );
    });

    try {
        await loadGenres();
    } catch (err) {
        console.error(err);
        availableGenres = [
            'Rock',
            'Pop',
            'Rap',
            'Hip Hop'
        ];
        updateGenreUi();
    }
}

function getSelectedGenresAsString() {
    return selectedGenres.join(', ');
}

function getTracksFromModal() {
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

    return tracks;
}

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
    const selectedType =
        document.querySelector(
            '.album-type-btn.active'
        ).dataset.type;

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
            getSelectedGenresAsString(),
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
        tracks:
            getTracksFromModal()
    };

    console.log('ALBUM:', album);

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

        alert(selectedType + ' salvo!');

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

    setSelectedGenres(
        parseGenres(
            album.genrer ||
            album.genero ||
            ''
        )
    );

    document
        .getElementById('modal-album-servidor')
        .value = album.server || '';

    document
        .getElementById('modal-album-autor')
        .value = album.author || '';

    document
        .getElementById('modal-album-ano')
        .value = album.year || '';

    const genreSearchInput =
        document.getElementById('modal-genre-search');

    if (genreSearchInput) {
        genreSearchInput.value = '';
    }

    renderGenreOptions('');

    const albumType = album.type || 'album';

    const typeButtons = document.querySelectorAll('.album-type-btn');
    typeButtons.forEach(btn => {
        btn.classList.remove('active');

        if (btn.dataset.type === albumType) {
            btn.classList.add('active');
        }
    });

    document
        .getElementById('modal-preview-cover')
        .src =
        album.cover ||
        'https://placehold.co/400x400';

    const tracksContainer =
        document.getElementById(
            'modal-track-list'
        );

    tracksContainer.innerHTML = '';

    if (!album.tracks) {
        return;
    }

    album.tracks.forEach((track, index) => {
        const div =
            document.createElement('div');

        div.className = 'track-item';
        div.dataset.title = track.title || '';
        div.dataset.artist = track.artist || '';
        div.dataset.url = track.url || '';

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

    input.onchange = async event => {
        const file =
            event.target.files[0];

        if (!file) {
            return;
        }

        const text =
            await file.text();

        const album =
            JSON.parse(text);

        console.log(album);

        openAlbumModal();
        fillAlbumModal(album);
    };

    input.click();
}

// =========================
// SALVAR COMO JSON
// =========================

export async function saveAlbumAsJson() {
    const activeTypeButton =
        document.querySelector(
            '.album-type-btn.active'
        );

    const albumType =
        activeTypeButton
            ? activeTypeButton.dataset.type
            : 'album';

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
            getSelectedGenresAsString(),
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
        type: albumType,
        tracks:
            getTracksFromModal()
    };

    try {
        const dirHandle =
            await window.showDirectoryPicker();

        const fileName =
            `${album.album} - ${album.artist}.json`;

        const fileHandle =
            await dirHandle.getFileHandle(
                fileName,
                { create: true }
            );

        const writable =
            await fileHandle.createWritable();

        await writable.write(
            JSON.stringify(album, null, 2)
        );

        await writable.close();

        alert(albumType + ' salvo com sucesso!');
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
        typeButtons.forEach(button => {
            button.classList.remove('active');
        });

        btn.classList.add('active');
    });
});
