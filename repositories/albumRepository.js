import {
    all,
    get,
    run
} from './dbHelpers.js';

export function findAllAlbums() {
    return all(`
        SELECT *
        FROM albums
        ORDER BY id DESC
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
            autor,
            source_url
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        album.artist,
        album.album,
        album.year,
        album.genrer,
        album.cover,
        album.server,
        album.author,
        album.sourceUrl || album.source_url || ''
    ]);
}

export function updateAlbumById(albumId, album) {
    return run(`
        UPDATE albums
        SET
            artista_nome = ?,
            titulo = ?,
            ano = ?,
            genero = ?,
            cover = ?,
            servidor = ?,
            autor = ?,
            source_url = ?
        WHERE id = ?
    `, [
        album.artist,
        album.album,
        album.year,
        album.genrer,
        album.cover,
        album.server,
        album.author,
        album.sourceUrl || album.source_url || '',
        albumId
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
            track.artist || artist,
            track.url
        ]);
    }
}

export function deleteAlbumTracksByAlbumId(albumId) {
    return run(`
        DELETE FROM musicas
        WHERE album_id = ?
    `, [albumId]);
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

export function findAlbumBySourceUrl(sourceUrl) {
    return get(`
        SELECT *
        FROM albums
        WHERE source_url = ?
        LIMIT 1
    `, [sourceUrl]);
}

export function findAlbumByMetadata(title, server, artist) {
    return get(`
        SELECT *
        FROM albums
        WHERE
            titulo = ?
            AND servidor = ?
            AND artista_nome = ?
        ORDER BY id DESC
        LIMIT 1
    `, [title, server, artist]);
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

export function updateAlbumTrackById(trackId, music) {
    return run(`
        UPDATE musicas
        SET
            titulo = ?,
            artista = ?,
            url = ?
        WHERE id = ?
    `, [
        music.title,
        music.artist,
        music.url,
        trackId
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
