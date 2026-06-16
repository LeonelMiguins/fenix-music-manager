import express from 'express';

import fs from 'fs';
import {
    createExportFilePath,
    paths
} from '../config/index.js';
import { exportDB } from '../scripts/exportDb.js';

const router =
    express.Router();

router.get(
    '/db-json',

    async (req, res) => {

        try {

            const data =
                await exportDB();

            if (
                !fs.existsSync(paths.tempDir)
            ) {

                fs.mkdirSync(
                    paths.tempDir,
                    { recursive: true }
                );

            }

            const filePath =
                createExportFilePath();

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
