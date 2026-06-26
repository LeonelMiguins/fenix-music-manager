import express from 'express';
import db from './routes/database.js';
import exportRoutes from './routes/export.js';
import albumRoutes from './routes/albums.js';
import { scrapeArchive } from './scripts/archiveScraper.js';
import { scrapePalco } from './scripts/palcoScraper.js';
import { runArchiveProfileBatchImport } from './scripts/archiveProfileBatchScraper.js';
import playlistRoutes from './routes/playlists.js';
import backupRoutes from './routes/backup.js';
import searchRoutes from './routes/search.js';
import dashboardRoutes from './routes/dashboard.js';
import { appConfig, paths } from './config/index.js';
import { findAlbumDuplicateCandidate } from './services/albumServices.js';
import { findPlaylistDuplicateCandidate } from './services/playlistService.js';


const app = express();

async function findDuplicateItem(item) {
    if (item.type === 'playlist') {
        return findPlaylistDuplicateCandidate(item);
    }

    return findAlbumDuplicateCandidate(item);
}

// MIDDLEWARES
app.use(express.json());

// arquivos estaticos
app.use(express.static(paths.webRoot));

// ROUTES

// albums
app.use('/api/albums',albumRoutes);
// playlists
app.use('/api/playlists', playlistRoutes);
// export database
app.use('/api/export',exportRoutes);

app.use('/api/backup-db', backupRoutes);

app.use('/api/search',searchRoutes);
app.use('/api/dashboard', dashboardRoutes);

// SCRAPER ARCHIVE

app.post(
    '/api/scrape/archive',

    async (req, res) => {

        try {

            const { url } =
                req.body;

            const album =
                await scrapeArchive(url);

            // erro

            if (!album) {

                return res.status(404).json({

                    success: false,

                    error:
                        'album nao encontrado'
                });
            }

            const existingItem =
                await findDuplicateItem(album);

            // sucesso

            res.json({

                success: true,
                album,
                duplicate: Boolean(existingItem),
                existing: existingItem
                    ? {
                        id: existingItem.id,
                        titulo: existingItem.titulo
                    }
                    : null
            });

        } catch (err) {

            console.log(err);

            res.status(500).json({

                success: false,

                error:
                    'erro interno'
            });
        }
    }
);

app.post(
    '/api/scrape/archive/profile',

    async (req, res) => {

        try {

            const {
                profileUrl,
                delayMs,
                limit,
                dryRun
            } = req.body;

            const result =
                await runArchiveProfileBatchImport({
                    profileUrl,
                    delayMs:
                        Number.parseInt(delayMs, 10) || 1500,
                    limit:
                        Number.parseInt(limit, 10) || 20,
                    dryRun: Boolean(dryRun),
                    showBrowser: false
                });

            res.json({
                success: true,
                result: {
                    found: result.detailUrls.length,
                    imported: result.imported.length,
                    skipped: result.skipped.length,
                    failed: result.failed.length,
                    preview: result.preview.length,
                    importedItems: result.imported,
                    skippedItems: result.skipped,
                    failedItems: result.failed,
                    previewItems: result.preview
                }
            });

        } catch (err) {

            console.log(err);

            res.status(500).json({

                success: false,

                error:
                    err.message || 'erro interno'
            });
        }
    }
);



// =========================
// TESTE DB
// =========================

app.get('/api/test-db', (req, res) => {

    db.all(`
        SELECT * FROM albums
    `, [], (err, rows) => {

        if (err) {

            console.error(err);

            return res.status(500).json({
                error: err.message
            });
        }

        res.json(rows);

    });

});

// =========================
// PALCO SCRAPER
// =========================


app.post(
    '/api/scrape/palco',

    async (req, res) => {

        try {

            const { url } =
                req.body;

            const album =
                await scrapePalco(url);

            if (!album) {

                return res.status(404).json({

                    success: false,

                    error:
                        'album nao encontrado'
                });
            }

            const existingItem =
                await findDuplicateItem(album);

            res.json({

                success: true,
                album,
                duplicate: Boolean(existingItem),
                existing: existingItem
                    ? {
                        id: existingItem.id,
                        titulo: existingItem.titulo
                    }
                    : null
            });

        } catch (err) {

            console.log(err);

            res.status(500).json({

                success: false,

                error:
                    'erro interno'
            });
        }
    }
);

// =========================
// INDEX
// =========================

app.get('/', (req, res) => {

    res.sendFile(
        paths.webIndexFile
    );
});



// =========================
// SERVER
// =========================

app.listen(appConfig.port, () => {

    console.log(`
🚀 servidor:
http://localhost:${appConfig.port}
    `);

});
