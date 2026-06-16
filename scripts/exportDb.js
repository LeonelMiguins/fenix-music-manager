import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';

sqlite3.verbose();

const __filename =
    fileURLToPath(import.meta.url);

const __dirname =
    path.dirname(__filename);

const projectRoot =
    path.resolve(__dirname, '..');

export async function exportDB() {

    const dbPath =
        path.join(
            projectRoot,
            'db',
            'music.db'
        );

    const db =
        new sqlite3.Database(dbPath);

    const getAll = (sql) => {

        return new Promise(
            (resolve, reject) => {

                db.all(
                    sql,
                    (err, rows) => {

                        if (err) {

                            reject(err);

                        } else {

                            resolve(rows);

                        }

                    }
                );

            }
        );

    };

    try {

        // =========================
        // TABLES
        // =========================

        const albums =
            await getAll(`
                SELECT *
                FROM albums
            `);

        const musicas =
            await getAll(`
                SELECT *
                FROM musicas
            `);

        const playlists =
            await getAll(`
                SELECT *
                FROM playlists
            `);

        const playlistsMusicas =
            await getAll(`
                SELECT *
                FROM playlists_musicas
            `);

        // =========================
        // ALBUMS
        // =========================

        const albumsFormatados =
            albums.map(album => {

                const tracks =
                    musicas
                        .filter(
                            m =>
                                m.album_id ===
                                album.id
                        )
                        .map(track => ({

                            title:
                                track.titulo,

                            artist:
                                track.artista,

                            url:
                                track.url

                        }));

                return {

                    id:
                        album.id,

                    type:
                        'album',

                    album:
                        album.titulo,

                    artist:
                        album.artista_nome,

                    related:
                        album.artista_relacionado,

                    year:
                        album.ano,

                    genrer:
                        album.genero,

                    cover:
                        album.cover,

                    server:
                        album.servidor,

                    author:
                        album.autor,

                    tracks

                };

            });

        // =========================
        // PLAYLISTS
        // =========================

        const playlistsFormatadas =
            playlists.map(playlist => {

                const tracks =
                    playlistsMusicas
                        .filter(
                            m =>
                                m.playlist_id ===
                                playlist.id
                        )
                        .map(track => ({

                            title:
                                track.titulo,

                            artist:
                                track.artista,

                            url:
                                track.url,

                            //cover:
                                //track.cover

                        }));

                return {

                    id:
                        playlist.id,

                    type:
                        'playlist',

                    album:
                        playlist.titulo,

                    artist:
                        playlist.artista_nome,

                    related:
                        playlist.artista_relacionado,

                    year:
                        playlist.ano,

                    genrer:
                        playlist.genero,

                    cover:
                        playlist.cover,

                    server:
                        playlist.servidor,

                    author:
                        playlist.autor,

                    tracks

                };

            });

        // =========================
        // JSON FINAL
        // =========================

        const exportData = {

            albums:
                albumsFormatados,

            playlists:
                playlistsFormatadas

        };

        db.close();

        return exportData;

    } catch (err) {

        db.close();

        throw err;

    }

}
