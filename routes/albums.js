import express from 'express';
import db from './database.js';

import {
    getAlbums,
    addAlbum,
    deleteAlbum
} from '../services/albumservices.js';

const router = express.Router();

// =========================
// GET ALL
// =========================

router.get('/', async (req, res) => {
    const albums = await getAlbums();
    res.json(albums);
});

// =========================
// CREATE
// =========================

router.post('/', async (req, res) => {

    const album = req.body;

    // =========================
    // PLAYLIST
    // =========================

    if (album.type === 'playlist') {

        db.run(`
            INSERT INTO playlists (
                artista_nome,
                artista_relacionado,
                titulo,
                ano,
                genero,
                cover,
                servidor,
                autor
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            album.artist,
            album.related,
            album.album,
            album.year,
            album.genrer,
            album.cover,
            album.server,
            album.author
        ], function (err) {

            if (err) {
                console.error(err);
                return res.status(500).json({ error: err.message });
            }

            const playlistId = this.lastID;

            if (!album.tracks || album.tracks.length === 0) {
                return res.json({
                    success: true,
                    playlistId
                });
            }

            const stmt = db.prepare(`
                INSERT INTO playlists_musicas (
                    playlist_id,
                    titulo,
                    artista,
                    url,
                    cover
                )
                VALUES (?, ?, ?, ?, ?)
            `);

            album.tracks.forEach(track => {
                stmt.run([
                    playlistId,
                    track.title,
                    album.artist,
                    track.url,
                    album.cover
                ]);
            });

            stmt.finalize();

            res.json({
                success: true,
                playlistId
            });

        });

        return;
    }

    // =========================
    // ÁLBUM NORMAL
    // =========================

    db.run(`
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
    ], function (err) {

        if (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
        }

        const albumId = this.lastID;

        // =========================
        // INSERT MUSICAS
        // =========================

        if (album.tracks && album.tracks.length > 0) {

            const stmt = db.prepare(`
                INSERT INTO musicas (
                    album_id,
                    titulo,
                    artista,
                    url
                )
                VALUES (?, ?, ?, ?)
            `);

            album.tracks.forEach(track => {
                stmt.run([
                    albumId,
                    track.title,
                    album.artist,
                    track.url
                ]);
            });

            stmt.finalize();
        }

        res.json({
            success: true,
            albumId
        });

    }); // ✅ FECHAMENTO CORRETO DO db.run
});

// =========================
// DELETE
// =========================

router.delete('/:id', async (req, res) => {
    await deleteAlbum(req.params.id);

    res.json({
        success: true
    });
});

// =========================
// GET ONE
// =========================

router.get('/:id', (req, res) => {

    const id = req.params.id;

    db.get(`
        SELECT *
        FROM albums
        WHERE id = ?
    `, [id], (err, album) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        db.all(`
            SELECT *
            FROM musicas
            WHERE album_id = ?
        `, [id], (err, tracks) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            album.tracks = tracks;
            res.json(album);

        });

    });

});

// =========================
// ADD MUSIC TO ALBUM
// =========================

router.post('/:id/music', (req, res) => {

    const albumId = req.params.id;
    const music = req.body;

    db.run(`
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
    ], function (err) {

        if (err) {
            console.log(err);
            return res.status(500).json({
                error: err.message
            });
        }

        res.json({
            success: true
        });

    });

});

export default router;