import express from 'express';
import { getDashboardSummary } from '../services/dashboardService.js';

const router = express.Router();

router.get('/summary', async (req, res) => {
    try {
        const summary = await getDashboardSummary();
        res.json(summary);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
