import express from 'express';

import {
    addAlbum,
    addMusicToAlbum,
    getAlbumById,
    getAlbums,
    deleteAlbum,
    updateAlbum
} from '../services/albumServices.js';
import { createPlaylist } from '../services/playlistService.js';

const router = express.Router();

// =========================
// GET ALL
// =========================

router.get('/', async (req, res) => {
    try {
        const albums = await getAlbums();
        res.json(albums);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// =========================
// CREATE
// =========================

router.post('/', async (req, res) => {
    try {
        const album = req.body;

        if (album.type === 'playlist') {
            const playlistId = await createPlaylist(album);

            return res.json({
                success: true,
                playlistId
            });
        }

        const albumId = await addAlbum(album);

        res.json({
            success: true,
            albumId
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// =========================
// DELETE
// =========================

router.delete('/:id', async (req, res) => {
    try {
        await deleteAlbum(req.params.id);

        res.json({
            success: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// =========================
// GET ONE
// =========================

router.get('/:id', async (req, res) => {
    try {
        const album = await getAlbumById(req.params.id);

        if (!album) {
            return res.status(404).json({
                error: 'album nao encontrado'
            });
        }

        res.json(album);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        await updateAlbum(req.params.id, req.body);

        res.json({
            success: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// =========================
// ADD MUSIC TO ALBUM
// =========================

router.post('/:id/music', async (req, res) => {
    try {
        await addMusicToAlbum(req.params.id, req.body);

        res.json({
            success: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
