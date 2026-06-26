import db from '../routes/database.js';
import { addAlbum } from '../services/albumServices.js';
import { scrapeArchive } from './archiveScraper.js';

function parseArgs(argv) {
    const options = {
        profileUrl: '',
        delayMs: 2000,
        limit: Infinity,
        showBrowser: false,
        dryRun: false
    };

    for (const arg of argv) {
        if (!arg.startsWith('--') && !options.profileUrl) {
            options.profileUrl = arg;
            continue;
        }

        if (arg.startsWith('--delay=')) {
            options.delayMs =
                Number.parseInt(arg.split('=')[1], 10) || 2000;
        }

        if (arg.startsWith('--limit=')) {
            const parsedLimit =
                Number.parseInt(arg.split('=')[1], 10);

            options.limit =
                Number.isFinite(parsedLimit) && parsedLimit > 0
                    ? parsedLimit
                    : Infinity;
        }

        if (arg === '--show-browser') {
            options.showBrowser = true;
        }

        if (arg === '--dry-run') {
            options.dryRun = true;
        }
    }

    return options;
}

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

function normalizeDetailUrl(url) {
    try {
        const parsedUrl = new URL(url, 'https://archive.org');
        const match = parsedUrl.pathname.match(/\/details\/([^/?#]+)/i);

        if (!match?.[1] || match[1].startsWith('@')) {
            return '';
        }

        return `https://archive.org/details/${match[1]}`;
    } catch {
        return '';
    }
}

function getProfileSlug(profileUrl) {
    try {
        const parsedUrl = new URL(profileUrl);
        const match =
            parsedUrl.pathname.match(/\/details\/@([^/]+)/i);

        return match?.[1] || '';
    } catch {
        return '';
    }
}

function findExistingAlbumByTitleAndAuthor(title, author) {
    return new Promise((resolve, reject) => {
        db.get(`
            SELECT
                albums.id,
                albums.titulo,
                albums.autor
            FROM albums
            WHERE
                titulo = ?
                AND autor = ?
            LIMIT 1
        `, [title, author], (err, row) => {
            if (err) reject(err);
            else resolve(row || null);
        });
    });
}

function findExistingAlbumBySourceUrl(sourceUrl) {
    return new Promise((resolve, reject) => {
        db.get(`
            SELECT
                albums.id,
                albums.titulo,
                albums.source_url
            FROM albums
            WHERE source_url = ?
            LIMIT 1
        `, [sourceUrl], (err, row) => {
            if (err) reject(err);
            else resolve(row || null);
        });
    });
}

async function collectAlbumLinksWithPlaywright(profileUrl, limit, showBrowser) {
    const { chromium } =
        await import('playwright');

    const browser =
        await chromium.launch({
            headless: !showBrowser
        });

    const page =
        await browser.newPage({
            viewport: {
                width: 1440,
                height: 1200
            }
        });

    try {
        await page.goto(profileUrl, {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        await page.waitForLoadState('networkidle', {
            timeout: 60000
        }).catch(() => null);

        await page.waitForFunction(() => {
            function collectFromRoot(root, links) {
                root
                    .querySelectorAll('img[src*="/services/img/"]')
                    .forEach(image => {
                        const src = image.getAttribute('src') || '';
                        const className = image.getAttribute('class') || '';
                        const match = src.match(/\/services\/img\/([^/?#]+)/i);

                        if (
                            className.includes('contain') &&
                            match?.[1] &&
                            !match[1].startsWith('@')
                        ) {
                            links.add(`/details/${match[1]}`);
                        }
                    });

                root.querySelectorAll('*').forEach(node => {
                    if (node.shadowRoot) {
                        collectFromRoot(node.shadowRoot, links);
                    }
                });
            }

            const links = new Set();
            collectFromRoot(document, links);

            return links.size > 0;
        }, {
            timeout: 60000
        });

        let previousCount = 0;
        let stableRounds = 0;

        while (stableRounds < 3) {
            const currentLinks = await page.evaluate(() => {
                function collectFromRoot(root, links) {
                    root
                        .querySelectorAll('img[src*="/services/img/"]')
                        .forEach(image => {
                            const src = image.getAttribute('src') || '';
                            const className = image.getAttribute('class') || '';
                            const match = src.match(/\/services\/img\/([^/?#]+)/i);

                            if (
                                className.includes('contain') &&
                                match?.[1] &&
                                !match[1].startsWith('@')
                            ) {
                                links.add(`/details/${match[1]}`);
                            }
                        });

                    root.querySelectorAll('*').forEach(node => {
                        if (node.shadowRoot) {
                            collectFromRoot(node.shadowRoot, links);
                        }
                    });
                }

                const detailLinks = new Set();
                collectFromRoot(document, detailLinks);

                return Array.from(detailLinks);
            });

            const count = currentLinks.length;

            if (count >= limit) {
                break;
            }

            if (count === previousCount) {
                stableRounds += 1;
            } else {
                stableRounds = 0;
                previousCount = count;
            }

            await page.mouse.wheel(0, 4000);
            await page.waitForTimeout(1500);
        }

        const rawLinks = await page.evaluate(() => {
            function collectFromRoot(root, links) {
                root
                    .querySelectorAll('img[src*="/services/img/"]')
                    .forEach(image => {
                        const src = image.getAttribute('src') || '';
                        const className = image.getAttribute('class') || '';
                        const match = src.match(/\/services\/img\/([^/?#]+)/i);

                        if (
                            className.includes('contain') &&
                            match?.[1] &&
                            !match[1].startsWith('@')
                        ) {
                            links.add(`/details/${match[1]}`);
                        }
                    });

                root.querySelectorAll('*').forEach(node => {
                    if (node.shadowRoot) {
                        collectFromRoot(node.shadowRoot, links);
                    }
                });
            }

            const detailLinks = new Set();
            collectFromRoot(document, detailLinks);

            return Array.from(detailLinks);
        });

        return rawLinks
            .map(normalizeDetailUrl)
            .filter(Boolean)
            .slice(0, limit);
    } finally {
        await browser.close();
    }
}

async function collectAlbumLinksWithSearchFallback(profileUrl, limit) {
    const slug = getProfileSlug(profileUrl);

    if (!slug) {
        throw new Error('perfil invalido');
    }

    const creatorName =
        slug.replaceAll('_', ' ');

    const encodedQuery =
        encodeURIComponent(`creator:"${creatorName}"`);

    const response =
        await fetch(
            `https://archive.org/advancedsearch.php?q=${encodedQuery}&fl[]=identifier&rows=${Number.isFinite(limit) ? Math.min(limit, 100) : 100}&page=1&output=json`
        );

    const data =
        await response.json();

    return (data?.response?.docs || [])
        .map(item =>
            normalizeDetailUrl(
                `https://archive.org/details/${item.identifier}`
            )
        )
        .filter(Boolean)
        .slice(0, limit);
}

async function collectAlbumLinks(profileUrl, limit, showBrowser) {
    try {
        return await collectAlbumLinksWithPlaywright(
            profileUrl,
            limit,
            showBrowser
        );
    } catch (err) {
        console.warn(
            'Falha ao ler o perfil com Playwright. Tentando fallback por busca...',
            err.message
        );

        return collectAlbumLinksWithSearchFallback(
            profileUrl,
            limit
        );
    }
}

async function importAlbum(detailUrl, index, total, delayMs, dryRun) {
    console.log(`[${index}/${total}] lendo ${detailUrl}`);

    const album =
        await scrapeArchive(detailUrl);

    if (!album || !album.tracks?.length) {
        console.log(
            `[${index}/${total}] falhou ${detailUrl} - sem faixas importáveis`
        );

        return {
            status: 'failed',
            url: detailUrl,
            reason: 'album vazio ou nao importavel'
        };
    }

    album.sourceUrl = detailUrl;
    album.link_site = detailUrl;

    const existingAlbum =
        await findExistingAlbumBySourceUrl(
            detailUrl
        ) ||
        await findExistingAlbumByTitleAndAuthor(
            album.album,
            album.author
        );

    if (existingAlbum) {
        console.log(
            `[${index}/${total}] pulando ${detailUrl} - já salvo como "${existingAlbum.titulo}"`
        );

        return {
            status: 'skipped',
            url: detailUrl,
            reason: 'ja importado'
        };
    }

    if (dryRun) {
        console.log(
            `[${index}/${total}] dry-run ${album.album} (${album.tracks.length} faixas)`
        );

        return {
            status: 'preview',
            url: detailUrl,
            title: album.album
        };
    }

    const albumId =
        await addAlbum(album);

    console.log(
        `[${index}/${total}] salvo #${albumId} - ${album.album} (${album.tracks.length} faixas)`
    );

    if (delayMs > 0 && index < total) {
        await sleep(delayMs);
    }

    return {
        status: 'imported',
        url: detailUrl,
        title: album.album,
        albumId
    };
}

export async function runArchiveProfileBatchImport(inputOptions = {}) {
    const options = {
        profileUrl: inputOptions.profileUrl || '',
        delayMs: inputOptions.delayMs ?? 2000,
        limit: inputOptions.limit ?? Infinity,
        showBrowser: Boolean(inputOptions.showBrowser),
        dryRun: Boolean(inputOptions.dryRun)
    };

    if (!options.profileUrl) {
        throw new Error('profileUrl obrigatoria');
    }

    console.log(`Perfil: ${options.profileUrl}`);
    console.log(`Delay: ${options.delayMs}ms`);
    console.log(`Limite: ${Number.isFinite(options.limit) ? options.limit : 'sem limite'}`);

    const detailUrls =
        await collectAlbumLinks(
            options.profileUrl,
            options.limit,
            options.showBrowser
        );

    if (detailUrls.length === 0) {
        console.log('Nenhum álbum encontrado no perfil.');
        return;
    }

    console.log(`Links encontrados: ${detailUrls.length}`);

    const summary = {
        imported: [],
        skipped: [],
        failed: [],
        preview: []
    };

    for (let index = 0; index < detailUrls.length; index += 1) {
        const result =
            await importAlbum(
                detailUrls[index],
                index + 1,
                detailUrls.length,
                options.delayMs,
                options.dryRun
            );

        if (result.status === 'imported') {
            summary.imported.push(result);
        }

        if (result.status === 'skipped') {
            summary.skipped.push(result);
        }

        if (result.status === 'failed') {
            summary.failed.push(result);
        }

        if (result.status === 'preview') {
            summary.preview.push(result);
        }
    }

    console.log('\nResumo final:');
    console.log(`Importados: ${summary.imported.length}`);
    console.log(`Pulados: ${summary.skipped.length}`);
    console.log(`Falharam: ${summary.failed.length}`);
    console.log(`Preview: ${summary.preview.length}`);

    return {
        detailUrls,
        ...summary
    };
}

async function runCli() {
    const options =
        parseArgs(process.argv.slice(2));

    if (!options.profileUrl) {
        console.log(`
Uso:
node scripts/archiveProfileBatchScraper.js "https://archive.org/details/@usuario/uploads" --delay=2000 --limit=50

Opções:
--delay=2000       espera entre um álbum e outro
--limit=50         limita quantos links importar
--show-browser     abre o browser visível
--dry-run          só descobre e testa os álbuns, sem salvar no banco
        `);
        return;
    }

    await runArchiveProfileBatchImport(options);
}

if (process.argv[1]?.endsWith('archiveProfileBatchScraper.js')) {
    runCli()
        .catch(err => {
            console.error('Erro no scraper em lote:', err);
            process.exitCode = 1;
        })
        .finally(() => {
            db.close();
        });
}
