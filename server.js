import express from 'express';
import path from 'path';
import { fileURLToPath }from 'url';
import db from './routes/database.js';
import exportRoutes from './routes/export.js';
import albumRoutes from './routes/albums.js';
import { scrapeArchive } from './scripts/archiveScraper.js';
import { scrapePalco } from './scripts/palcoScraper.js';
import playlistRoutes from './routes/playlists.js';


const app = express();
const PORT = 3000;

// PATHS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MIDDLEWARES
app.use(express.json());

// arquivos estaticos
app.use( express.static( path.join(__dirname, 'www'))
);

// ROUTES

// albums
app.use('/api/albums',albumRoutes);
// playlists
app.use('/api/playlists', playlistRoutes);
// export database
app.use('/api/export',exportRoutes);

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

            // sucesso

            res.json({

                success: true,

                album
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

            res.json({

                success: true,

                album
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

        path.join(
            __dirname,
            'www',
            'index.html'
        )
    );
});



// =========================
// SERVER
// =========================

app.listen(PORT, () => {

    console.log(`
🚀 servidor:
http://localhost:${PORT}
    `);

});