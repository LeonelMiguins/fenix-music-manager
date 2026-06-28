import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { paths } from '../config/index.js';

// =========================
// EXPORT JSON (OPCIONAL)
// =========================

function saveAlbumJson(albumData) {

    if (!fs.existsSync(paths.albumsJsonDir)) {
        fs.mkdirSync(
            paths.albumsJsonDir,
            { recursive: true }
        );
    }

    const safeName = albumData.album
        .replace(/[<>:"/\\|?*]/g, '');

    fs.writeFileSync(
        path.join(
            paths.albumsJsonDir,
            `${safeName}.json`
        ),
        JSON.stringify(albumData, null, 2)
    );

    console.log('📁 JSON salvo:', safeName);
}

// =========================
// SCRAPER PRINCIPAL
// =========================

function buildArchiveFileUrl(itemId, fileName) {
    const encodedPath =
        String(fileName || '')
            .split('/')
            .map(part => encodeURIComponent(part))
            .join('/');

    return `https://archive.org/download/${itemId}/${encodedPath}`;
}

function isSupportedAudioFile(file = {}) {
    const fileName =
        String(file.name || '').toLowerCase();

    const format =
        String(file.format || '').toLowerCase();

    if (
        fileName.endsWith('.png') ||
        fileName.endsWith('.jpg') ||
        fileName.endsWith('.jpeg') ||
        fileName.endsWith('.gif')
    ) {
        return false;
    }

    return (
        fileName.endsWith('.mp3') ||
        fileName.endsWith('.flac') ||
        fileName.endsWith('.ogg') ||
        fileName.endsWith('.wav') ||
        fileName.endsWith('.m4a') ||
        format.includes('mp3') ||
        format.includes('flac') ||
        format.includes('ogg') ||
        format.includes('wave') ||
        format.includes('m4a')
    );
}

function scoreArchiveAudioFile(file = {}) {
    const fileName =
        String(file.name || '').toLowerCase();

    const format =
        String(file.format || '').toLowerCase();

    let score = 0;

    if (String(file.source || '').toLowerCase() === 'derivative') {
        score += 20;
    }

    if (fileName.endsWith('.mp3') || format.includes('mp3')) {
        score += 10;
    }

    if (file.title) {
        score += 5;
    }

    if (file.track) {
        score += 5;
    }

    return score;
}

function extractTracksFromMetadata(itemId, files = []) {
    const groupedFiles =
        new Map();

    files
        .filter(isSupportedAudioFile)
        .forEach(file => {
            const originalKey =
                file.original ||
                file.name;

            const current =
                groupedFiles.get(originalKey);

            if (!current) {
                groupedFiles.set(originalKey, file);
                return;
            }

            if (
                scoreArchiveAudioFile(file) >
                scoreArchiveAudioFile(current)
            ) {
                groupedFiles.set(originalKey, file);
            }
        });

    return Array.from(groupedFiles.values())
        .sort((left, right) => {
            const leftTrack =
                Number.parseInt(left.track, 10);
            const rightTrack =
                Number.parseInt(right.track, 10);

            if (
                Number.isFinite(leftTrack) &&
                Number.isFinite(rightTrack) &&
                leftTrack !== rightTrack
            ) {
                return leftTrack - rightTrack;
            }

            return String(left.name || '')
                .localeCompare(String(right.name || ''));
        })
        .map((file, index) => ({
            title:
                file.title ||
                decodeURIComponent(
                    String(file.name || '')
                        .split('/')
                        .pop() || ''
                )
                    .replace(/\.[^.]+$/, '') ||
                `Faixa ${index + 1}`,
            artist:
                file.artist ||
                file.creator ||
                'Desconhecido',
            url:
                buildArchiveFileUrl(
                    itemId,
                    file.name
                )
        }));
}

export async function scrapeArchive(url) {

    try {

        const itemId = url.split('/details/')[1];

        if (!itemId) {
            throw new Error('url invalida');
        }

        const downloadUrl =
            `https://archive.org/download/${itemId}/`;

        const metadataUrl =
            `https://archive.org/metadata/${itemId}`;

        // =========================
        // PAGE
        // =========================

        const { data: html } = await axios.get(url);
        const $ = cheerio.load(html);

        // =========================
        // DADOS
        // =========================

        const albumName =
            $("h1.item-title span[itemprop='name']")
                .text()
                .trim();

        if (!albumName) {
            throw new Error('album nao encontrado');
        }

        const creator =
            $(".item-upload-info__uploader-name")
                .first()
                .text()
                .trim();

        const cover =
            $("img.img-responsive").attr("src");

        const { data: metadata } =
            await axios.get(metadataUrl);

        const metadataFiles =
            Array.isArray(metadata?.files)
                ? metadata.files
                : [];

        let tracks =
            extractTracksFromMetadata(
                itemId,
                metadataFiles
            );

        if (tracks.length === 0) {
            // fallback para itens antigos onde a listagem direta é suficiente
            const { data: downloadHtml } =
                await axios.get(downloadUrl);

            const $$ = cheerio.load(downloadHtml);

            tracks = [];

            $$("a").each((i, el) => {

                const href = $$(el).attr("href");

                if (href && href.endsWith(".mp3")) {

                    tracks.push({

                        title: decodeURIComponent(href)
                            .replace(".mp3", ""),

                        artist: 'Desconhecido',

                        url: downloadUrl + href
                    });
                }
            });
        }

        const archiveArtist =
            tracks[0]?.artist ||
            creator ||
            "Desconhecido";

        // =========================
        // ALBUM DATA FINAL
        // =========================

        const albumData = {

            type: 'album',

            album: albumName,

            artist: archiveArtist,

            server: "internet-archive",

            genrer: "Rock",

            author: creator,

            cover: cover?.startsWith('http')
                ? cover
                : 'https://archive.org' + cover,

            sourceUrl: url,

            tracks
        };

        // =========================
        // EXPORT JSON (OPCIONAL)
        // =========================

        // 👉 DESCOMENTE QUANDO QUISER SALVAR JSON LOCAL
        // saveAlbumJson(albumData);

        return albumData;

    } catch (err) {

        console.log(err);
        return null;
    }
}
