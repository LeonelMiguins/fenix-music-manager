import express from 'express';
import {
    addMusicToPlaylist,
    getPlaylistById,
    getPlaylists,
    removePlaylist,
    updatePlaylist,
    updatePlaylistTrack
} from '../services/playlistService.js';

const router = express.Router();

// =========================
// GET PLAYLISTS
// =========================

router.get('/', async (req, res) => {
    try {
        const playlists = await getPlaylists();
        res.json(playlists);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// =========================
// DELETE PLAYLIST
// =========================

router.delete('/:id', async (req, res) => {
    try {
        await removePlaylist(req.params.id);

        res.json({
            success: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        await updatePlaylist(req.params.id, req.body);

        res.json({
            success: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// =========================
// ADD MUSIC PLAYLIST
// =========================

router.post('/:id/music', async (req, res) => {
    try {
        await addMusicToPlaylist(req.params.id, req.body);

        res.json({
            success: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id/music/:trackId', async (req, res) => {
    try {
        await updatePlaylistTrack(req.params.trackId, req.body);

        res.json({
            success: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// =========================
// GET PLAYLIST BY ID
// =========================

router.get('/:id', async (req, res) => {
    try {
        const playlist = await getPlaylistById(req.params.id);

        if (!playlist) {
            return res.status(404).json({
                error: 'playlist nao encontrada'
            });
        }

        res.json(playlist);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});



export default router;
