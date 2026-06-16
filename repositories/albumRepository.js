import {
    all,
    get,
    run
} from './dbHelpers.js';

export function findAllAlbums() {
    return all(`
        SELECT *
        FROM albums
    `);
}

export function insertAlbum(album) {
    return run(`
        INSERT INTO albums (
            artista_nome,
            titulo,
            ano,
            genero,
            cover,
            servidor,
            autor
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
        album.artist,
        album.album,
        album.year,
        album.genrer,
        album.cover,
        album.server,
        album.author
    ]);
}

export async function insertAlbumTracks(albumId, tracks, artist) {
    for (const track of tracks) {
        await run(`
            INSERT INTO musicas (
                album_id,
                titulo,
                artista,
                url
            )
            VALUES (?, ?, ?, ?)
        `, [
            albumId,
            track.title,
            artist,
            track.url
        ]);
    }
}

export function findAlbumById(id) {
    return get(`
        SELECT *
        FROM albums
        WHERE id = ?
    `, [id]);
}

export function findAlbumTracksById(albumId) {
    return all(`
        SELECT *
        FROM musicas
        WHERE album_id = ?
    `, [albumId]);
}

export function deleteAlbumById(id) {
    return run(`
        DELETE FROM albums
        WHERE id = ?
    `, [id]);
}

export function insertMusicIntoAlbum(albumId, music) {
    return run(`
        INSERT INTO musicas (
            album_id,
            titulo,
            artista,
            url
        )
        VALUES (?, ?, ?, ?)
    `, [
        albumId,
        music.title,
        music.artist,
        music.url
    ]);
}

export function searchAlbums(search) {
    return all(`
        SELECT
            *,
            'album' as type
        FROM albums
        WHERE
            titulo LIKE ?
            OR artista_nome LIKE ?
        ORDER BY id DESC
    `, [search, search]);
}
