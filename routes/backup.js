// backup do banco de dados


import express from 'express';

import fs from 'fs';
import { paths } from '../config/index.js';

const router =
    express.Router();

router.post(
    '/',

    async (req, res) => {

        try {

            // =========================
            // PATHS
            // =========================

            // =========================
            // COPIA
            // =========================

            fs.copyFileSync(
                paths.dbFile,
                paths.dbBackupFile
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
