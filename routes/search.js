import express from 'express';
import { searchLibrary } from '../services/searchService.js';

const router =
    express.Router();

// =========================
// SEARCH
// =========================

router.get('/', async (req, res) => {
    try {
        const results = await searchLibrary(req.query.q);
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
