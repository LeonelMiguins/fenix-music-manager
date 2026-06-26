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
        includePlaylists = true,
        fields = {}
    } = options;

    const exportFields = {
        related: fields.related ?? true,
        year: fields.year ?? true,
        genrer: fields.genrer ?? true,
        description: fields.description ?? true,
        cover: fields.cover ?? true,
        server: fields.server ?? true,
        author: fields.author ?? true,
        savedAt: fields.savedAt ?? true,
        sourceUrl: fields.sourceUrl ?? true,
        origin: fields.origin ?? true
    };

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

            const formattedAlbum = {
                id: album.id,
                type: 'album',
                album: album.titulo,
                artist: album.artista_nome,
                tracks
            };

            if (exportFields.related) {
                formattedAlbum.related =
                    album.artista_relacionado ?? '';
            }

            if (exportFields.year) {
                formattedAlbum.year =
                    album.ano ?? '';
            }

            if (exportFields.genrer) {
                formattedAlbum.genrer =
                    album.genero ?? '';
            }

            if (exportFields.description) {
                formattedAlbum.description =
                    albumColumns.includes('descricao')
                        ? album.descricao ?? ''
                        : '';
            }

            if (exportFields.cover) {
                formattedAlbum.cover =
                    album.cover ?? '';
            }

            if (exportFields.server) {
                formattedAlbum.server =
                    album.servidor ?? '';
            }

            if (exportFields.author) {
                formattedAlbum.author =
                    album.autor ?? '';
            }

            if (exportFields.savedAt) {
                formattedAlbum.savedAt =
                    savedAt;
            }

            if (exportFields.sourceUrl) {
                formattedAlbum.sourceUrl =
                    album.source_url ||
                    origin?.link_site ||
                    '';
            }

            if (exportFields.origin) {
                formattedAlbum.origin = origin ? {
                    id: origin.id,
                    album_id: origin.album_id,
                    nome_album: origin.nome_album,
                    link_site: origin.link_site,
                    data_criacao: origin.data_criacao
                } : null;
            }

            return formattedAlbum;
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

            const formattedPlaylist = {
                id: playlist.id,
                type: 'playlist',
                album: playlist.titulo,
                artist: playlist.artista_nome,
                tracks
            };

            if (exportFields.related) {
                formattedPlaylist.related =
                    playlist.artista_relacionado ?? '';
            }

            if (exportFields.year) {
                formattedPlaylist.year =
                    playlist.ano ?? '';
            }

            if (exportFields.genrer) {
                formattedPlaylist.genrer =
                    playlist.genero ?? '';
            }

            if (exportFields.description) {
                formattedPlaylist.description =
                    playlistColumns.includes('descricao')
                        ? playlist.descricao ?? ''
                        : '';
            }

            if (exportFields.cover) {
                formattedPlaylist.cover =
                    playlist.cover ?? '';
            }

            if (exportFields.server) {
                formattedPlaylist.server =
                    playlist.servidor ?? '';
            }

            if (exportFields.author) {
                formattedPlaylist.author =
                    playlist.autor ?? '';
            }

            if (exportFields.savedAt) {
                formattedPlaylist.savedAt =
                    savedAt;
            }

            if (exportFields.sourceUrl) {
                formattedPlaylist.sourceUrl =
                    playlist.source_url || '';
            }

            return formattedPlaylist;
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
