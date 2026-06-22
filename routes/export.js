import express from 'express';
import { exportDB } from '../scripts/exportDb.js';

const router =
    express.Router();

router.post(
    '/songs-json',

    async (req, res) => {

        try {
            const {
                includeAlbums = true,
                includePlaylists = true,
                fields = {}
            } = req.body || {};

            const data =
                await exportDB({
                    includeAlbums:
                        Boolean(includeAlbums),
                    includePlaylists:
                        Boolean(includePlaylists),
                    fields
                });

            res.setHeader(
                'Content-Type',
                'application/json; charset=utf-8'
            );

            res.setHeader(
                'Content-Disposition',
                'attachment; filename="songs.json"'
            );

            res.send(
                JSON.stringify(
                    data,
                    null,
                    2
                )
            );

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
