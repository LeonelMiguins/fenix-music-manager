import {
    all,
    get
} from './dbHelpers.js';

export function countAlbums() {
    return get(`
        SELECT COUNT(*) as total
        FROM albums
    `);
}

export function countPlaylists() {
    return get(`
        SELECT COUNT(*) as total
        FROM playlists
    `);
}

export function countAlbumTracks() {
    return get(`
        SELECT COUNT(*) as total
        FROM musicas
    `);
}

export function countPlaylistTracks() {
    return get(`
        SELECT COUNT(*) as total
        FROM playlists_musicas
    `);
}

export function findRecentAlbums(limit = 4) {
    return all(`
        SELECT
            id,
            titulo,
            artista_nome,
            cover,
            servidor,
            ano,
            'album' as type
        FROM albums
        ORDER BY id DESC
        LIMIT ?
    `, [limit]);
}

export function findRecentPlaylists(limit = 4) {
    return all(`
        SELECT
            id,
            titulo,
            artista_nome,
            cover,
            servidor,
            ano,
            'playlist' as type
        FROM playlists
        ORDER BY id DESC
        LIMIT ?
    `, [limit]);
}

export function findLibrarySources() {
    return all(`
        SELECT
            servidor,
            COUNT(*) as total
        FROM (
            SELECT servidor FROM albums
            UNION ALL
            SELECT servidor FROM playlists
        )
        GROUP BY servidor
        ORDER BY total DESC, servidor ASC
    `);
}
