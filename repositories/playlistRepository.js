import {
    all,
    get,
    run
} from './dbHelpers.js';

export function findAllPlaylists() {
    return all(`
        SELECT *
        FROM playlists
        ORDER BY id DESC
    `);
}

export function insertPlaylist(playlist) {
    return run(`
        INSERT INTO playlists (
            artista_nome,
            artista_relacionado,
            titulo,
            ano,
            genero,
            cover,
            servidor,
            autor,
            source_url
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        playlist.artist,
        playlist.related,
        playlist.album,
        playlist.year,
        playlist.genrer,
        playlist.cover,
        playlist.server,
        playlist.author,
        playlist.sourceUrl || playlist.source_url || ''
    ]);
}

export function updatePlaylistById(playlistId, playlist) {
    return run(`
        UPDATE playlists
        SET
            artista_nome = ?,
            artista_relacionado = ?,
            titulo = ?,
            ano = ?,
            genero = ?,
            cover = ?,
            servidor = ?,
            autor = ?,
            source_url = ?
        WHERE id = ?
    `, [
        playlist.artist,
        playlist.related,
        playlist.album,
        playlist.year,
        playlist.genrer,
        playlist.cover,
        playlist.server,
        playlist.author,
        playlist.sourceUrl || playlist.source_url || '',
        playlistId
    ]);
}

export async function insertPlaylistTracks(playlistId, tracks, artist, cover) {
    for (const track of tracks) {
        await run(`
            INSERT INTO playlists_musicas (
                playlist_id,
                titulo,
                artista,
                url,
                cover
            )
            VALUES (?, ?, ?, ?, ?)
        `, [
            playlistId,
            track.title,
            track.artist || artist,
            track.url,
            track.cover || cover
        ]);
    }
}

export function deletePlaylistTracksByPlaylistId(playlistId) {
    return run(`
        DELETE FROM playlists_musicas
        WHERE playlist_id = ?
    `, [playlistId]);
}

export function deletePlaylistById(id) {
    return run(`
        DELETE FROM playlists
        WHERE id = ?
    `, [id]);
}

export function insertMusicIntoPlaylist(playlistId, music) {
    return run(`
        INSERT INTO playlists_musicas (
            playlist_id,
            titulo,
            artista,
            url,
            cover
        )
        VALUES (?, ?, ?, ?, ?)
    `, [
        playlistId,
        music.title,
        music.artist,
        music.url,
        music.cover
    ]);
}

export function updatePlaylistTrackById(trackId, music) {
    return run(`
        UPDATE playlists_musicas
        SET
            titulo = ?,
            artista = ?,
            url = ?,
            cover = ?
        WHERE id = ?
    `, [
        music.title,
        music.artist,
        music.url,
        music.cover,
        trackId
    ]);
}

export function findPlaylistById(id) {
    return get(`
        SELECT *
        FROM playlists
        WHERE id = ?
    `, [id]);
}

export function findPlaylistBySourceUrl(sourceUrl) {
    return get(`
        SELECT *
        FROM playlists
        WHERE source_url = ?
        LIMIT 1
    `, [sourceUrl]);
}

export function findPlaylistByMetadata(title, server, artist) {
    return get(`
        SELECT *
        FROM playlists
        WHERE
            titulo = ?
            AND servidor = ?
            AND artista_nome = ?
        ORDER BY id DESC
        LIMIT 1
    `, [title, server, artist]);
}

export function findPlaylistTracksById(playlistId) {
    return all(`
        SELECT *
        FROM playlists_musicas
        WHERE playlist_id = ?
    `, [playlistId]);
}

export function searchPlaylists(search) {
    return all(`
        SELECT
            *,
            'playlist' as type
        FROM playlists
        WHERE
            titulo LIKE ?
            OR artista_nome LIKE ?
        ORDER BY id DESC
    `, [search, search]);
}
