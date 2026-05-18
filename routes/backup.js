// backup do banco de dados


import express from 'express';

import fs from 'fs';
import path from 'path';

const router =
    express.Router();

router.post(
    '/',

    async (req, res) => {

        try {

            // =========================
            // PATHS
            // =========================

            const dbPath =
                path.resolve(
                    './db/music.db'
                );

            const backupPath =
                path.resolve(
                    './db/music_backup.db'
                );

            // =========================
            // COPIA
            // =========================

            fs.copyFileSync(
                dbPath,
                backupPath
            );

            // =========================
            // SUCCESS
            // =========================

            res.json({

                success: true,

                message:
                    'backup criado'

            });

        } catch (err) {

            console.log(err);

            res.status(500).json({

                success: false,

                error:
                    err.message

            });

        }

    }
);

export default router;