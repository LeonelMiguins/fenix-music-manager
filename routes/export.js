import express from 'express';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
    exportDB
}
from '../scripts/exportDb.js';

const __filename =
    fileURLToPath(import.meta.url);

const __dirname =
    path.dirname(__filename);

const projectRoot =
    path.resolve(__dirname, '..');

const router =
    express.Router();

router.get(
    '/db-json',

    async (req, res) => {

        try {

            const data =
                await exportDB();

            const tempDir =
                path.join(
                    projectRoot,
                    'temp'
                );

            if (
                !fs.existsSync(tempDir)
            ) {

                fs.mkdirSync(
                    tempDir,
                    { recursive: true }
                );

            }

            const filePath =
                path.join(

                    tempDir,

                    `fenix-backup-${Date.now()}.json`

                );

            fs.writeFileSync(

                filePath,

                JSON.stringify(
                    data,
                    null,
                    2
                )

            );

            res.download(filePath);

        } catch (err) {

            console.log(err);

            res.status(500).json({

                error:
                    err.message

            });

        }

    }
);

export default router;
