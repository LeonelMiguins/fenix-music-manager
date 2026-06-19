import sqlite3 from 'sqlite3';
import { paths } from '../config/index.js';

sqlite3.verbose();

function createGetAll(db) {
    return (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    };
}

async function tableExists(getAll, tableName) {
    const rows = await getAll(`
        SELECT name
        FROM sqlite_master
        WHERE type = 'table'
          AND name = ?
    `, [tableName]);

    return rows.length > 0;
}

async function getTableColumns(getAll, tableName) {
    const rows = await getAll(
        `PRAGMA table_info(${tableName})`
    );

    return rows.map(row => row.name);
}

function buildAlbumTrack(track) {
    return {
        title: track.titulo,
        artist: track.artista,
        url: track.url
    };
}

function buildPlaylistTrack(track) {
    return {
        title: track.titulo,
        artist: track.artista,
        url: track.url
    };
}

export async function exportDB(options = {}) {
    const {
        includeAlbums = true,
        includePlaylists = true
    } = options;

    const db =
        new sqlite3.Database(paths.dbFile);

    const getAll = createGetAll(db);

    try {
        const albumsTableExists =
            await tableExists(getAll, 'albums');

        const albumTracksTableExists =
            await tableExists(getAll, 'musicas');

        const playlistTableExists =
            await tableExists(getAll, 'playlists');

        const playlistTracksTableExists =
            await tableExists(getAll, 'playlists_musicas');

        const albumOriginsTableExists =
            await tableExists(getAll, 'album_origens');

        const albumColumns = albumsTableExists
            ? await getTableColumns(getAll, 'albums')
            : [];

        const playlistColumns = playlistTableExists
            ? await getTableColumns(getAll, 'playlists')
            : [];

        const albums =
            includeAlbums && albumsTableExists
                ? await getAll(`
                    SELECT *
                    FROM albums
                    ORDER BY id ASC
                `)
                : [];

        const musicas =
            includeAlbums && albumTracksTableExists
                ? await getAll(`
                    SELECT *
                    FROM musicas
                    ORDER BY id ASC
                `)
                : [];

        const albumOrigins =
            includeAlbums && albumOriginsTableExists
                ? await getAll(`
                    SELECT *
                    FROM album_origens
                    ORDER BY id ASC
                `)
                : [];

        const playlists =
            includePlaylists && playlistTableExists
                ? await getAll(`
                    SELECT *
                    FROM playlists
                    ORDER BY id ASC
                `)
                : [];

        const playlistsMusicas =
            includePlaylists && playlistTracksTableExists
                ? await getAll(`
                    SELECT *
                    FROM playlists_musicas
                    ORDER BY id ASC
                `)
                : [];

        const albumsFormatados = albums.map(album => {
            const origin =
                albumOrigins
                    .filter(item => item.album_id === album.id)
                    .at(-1) || null;

            const tracks =
                musicas
                    .filter(track => track.album_id === album.id)
                    .map(buildAlbumTrack);

            const savedAt =
                albumColumns.includes('data_criacao')
                    ? album.data_criacao || origin?.data_criacao || ''
                    : origin?.data_criacao || '';

            return {
                id: album.id,
                type: 'album',
                album: album.titulo,
                artist: album.artista_nome,
                related: album.artista_relacionado ?? '',
                year: album.ano ?? '',
                genrer: album.genero ?? '',
                cover: album.cover ?? '',
                server: album.servidor ?? '',
                author: album.autor ?? '',
                savedAt,
                sourceUrl: origin?.link_site || '',
                origin: origin ? {
                    id: origin.id,
                    album_id: origin.album_id,
                    nome_album: origin.nome_album,
                    link_site: origin.link_site,
                    data_criacao: origin.data_criacao
                } : null,
                tracks
            };
        });

        const playlistsFormatadas = playlists.map(playlist => {
            const tracks =
                playlistsMusicas
                    .filter(track => track.playlist_id === playlist.id)
                    .map(buildPlaylistTrack);

            const savedAt =
                playlistColumns.includes('data_criacao')
                    ? playlist.data_criacao || ''
                    : '';

            return {
                id: playlist.id,
                type: 'playlist',
                album: playlist.titulo,
                artist: playlist.artista_nome,
                related: playlist.artista_relacionado ?? '',
                year: playlist.ano ?? '',
                genrer: playlist.genero ?? '',
                cover: playlist.cover ?? '',
                server: playlist.servidor ?? '',
                author: playlist.autor ?? '',
                savedAt,
                tracks
            };
        });

        const exportData = {
            albums: includeAlbums
                ? albumsFormatados
                : [],
            playlists: includePlaylists
                ? playlistsFormatadas
                : []
        };

        db.close();

        return exportData;

    } catch (err) {

        db.close();

        throw err;

    }

}
