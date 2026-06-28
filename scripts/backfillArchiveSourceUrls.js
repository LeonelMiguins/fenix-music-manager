import axios from 'axios';
import sqlite3 from 'sqlite3';
import { paths } from '../config/index.js';

sqlite3.verbose();

function openDatabase() {
    return new sqlite3.Database(paths.dbFile);
}

function all(db, query, params = []) {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(rows);
        });
    });
}

function run(db, query, params = []) {
    return new Promise((resolve, reject) => {
        db.run(query, params, function onRun(err) {
            if (err) {
                reject(err);
                return;
            }

            resolve({
                changes: this.changes
            });
        });
    });
}

function close(db) {
    return new Promise((resolve, reject) => {
        db.close(err => {
            if (err) {
                reject(err);
                return;
            }

            resolve();
        });
    });
}

function parseArgs(argv) {
    const options = {
        dryRun: false,
        limit: Infinity
    };

    for (const arg of argv) {
        if (arg === '--dry-run') {
            options.dryRun = true;
        }

        if (arg.startsWith('--limit=')) {
            const parsedLimit =
                Number.parseInt(arg.split('=')[1], 10);

            options.limit =
                Number.isFinite(parsedLimit) && parsedLimit > 0
                    ? parsedLimit
                    : Infinity;
        }
    }

    return options;
}

function extractArchiveItemIds(value = '') {
    const source =
        String(value || '').trim();

    if (!source) {
        return [];
    }

    const candidates = new Set();
    const patterns = [
        /\/items\/([^/?#]+)/i,
        /\/download\/([^/?#]+)/i,
        /\/services\/img\/([^/?#]+)/i,
        /archive\.org\/details\/([^/?#]+)/i
    ];

    patterns.forEach(pattern => {
        const match =
            source.match(pattern);

        if (match?.[1]) {
            candidates.add(match[1]);
        }
    });

    return Array.from(candidates);
}

function buildCandidateUrls(album) {
    const itemIds = new Set([
        ...extractArchiveItemIds(album.cover),
        ...extractArchiveItemIds(album.source_url)
    ]);

    if (itemIds.size === 0) {
        return [];
    }

    return Array.from(itemIds).map(itemId => ({
        itemId,
        detailsUrl: `https://archive.org/details/${itemId}`
    }));
}

async function isValidArchiveDetailsUrl(url, expectedTitle = '') {
    try {
        const response =
            await axios.get(url, {
                timeout: 15000,
                validateStatus: () => true
            });

        if (response.status === 404) {
            return false;
        }

        if (response.status < 200 || response.status >= 300) {
            return false;
        }

        const html =
            String(response.data || '');

        if (!html.includes('item-title')) {
            return false;
        }

        if (!expectedTitle) {
            return true;
        }

        const normalizedTitle =
            expectedTitle
                .trim()
                .toLowerCase();

        return html.toLowerCase().includes(normalizedTitle);
    } catch {
        return false;
    }
}

async function findFirstValidSourceUrl(album) {
    const candidates =
        buildCandidateUrls(album);

    for (const candidate of candidates) {
        const isValid =
            await isValidArchiveDetailsUrl(
                candidate.detailsUrl,
                album.titulo
            );

        if (isValid) {
            return candidate.detailsUrl;
        }
    }

    return '';
}

async function getAlbumsToBackfill(db, limit) {
    const query = `
        SELECT
            id,
            titulo,
            cover,
            servidor,
            source_url
        FROM albums
        WHERE
            servidor = 'internet-archive'
            AND (source_url IS NULL OR TRIM(source_url) = '')
        ORDER BY id DESC
    `;

    const rows =
        await all(db, query);

    return Number.isFinite(limit)
        ? rows.slice(0, limit)
        : rows;
}

async function backfillArchiveSourceUrls(options = {}) {
    const db =
        openDatabase();

    const summary = {
        scanned: 0,
        updated: 0,
        skipped: 0,
        failed: 0,
        items: []
    };

    try {
        const albums =
            await getAlbumsToBackfill(
                db,
                options.limit ?? Infinity
            );

        summary.scanned = albums.length;

        for (const album of albums) {
            const sourceUrl =
                await findFirstValidSourceUrl(album);

            if (!sourceUrl) {
                summary.failed += 1;
                summary.items.push({
                    id: album.id,
                    title: album.titulo,
                    status: 'failed'
                });
                continue;
            }

            if (options.dryRun) {
                summary.updated += 1;
                summary.items.push({
                    id: album.id,
                    title: album.titulo,
                    status: 'preview',
                    sourceUrl
                });
                continue;
            }

            const result =
                await run(
                    db,
                    `
                        UPDATE albums
                        SET source_url = ?
                        WHERE id = ?
                    `,
                    [sourceUrl, album.id]
                );

            if (result.changes > 0) {
                summary.updated += 1;
                summary.items.push({
                    id: album.id,
                    title: album.titulo,
                    status: 'updated',
                    sourceUrl
                });
            } else {
                summary.skipped += 1;
                summary.items.push({
                    id: album.id,
                    title: album.titulo,
                    status: 'skipped'
                });
            }
        }

        return summary;
    } finally {
        await close(db);
    }
}

async function runCli() {
    const options =
        parseArgs(process.argv.slice(2));

    const summary =
        await backfillArchiveSourceUrls(options);

    console.log(`Itens analisados: ${summary.scanned}`);
    console.log(`Atualizados: ${summary.updated}`);
    console.log(`Pulados: ${summary.skipped}`);
    console.log(`Falharam: ${summary.failed}`);

    summary.items.slice(0, 20).forEach(item => {
        const suffix =
            item.sourceUrl
                ? ` -> ${item.sourceUrl}`
                : '';

        console.log(
            `[${item.status}] #${item.id} ${item.title}${suffix}`
        );
    });
}

if (process.argv[1]?.endsWith('backfillArchiveSourceUrls.js')) {
    runCli()
        .catch(err => {
            console.error(
                'Erro ao preencher source_url do Internet Archive:',
                err
            );
            process.exitCode = 1;
        });
}

export {
    backfillArchiveSourceUrls
};
