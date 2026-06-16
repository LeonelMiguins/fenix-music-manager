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

export async function scrapeArchive(url) {

    try {

        const itemId = url.split('/details/')[1];

        if (!itemId) {
            throw new Error('url invalida');
        }

        const downloadUrl =
            `https://archive.org/download/${itemId}/`;

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

        // =========================
        // DOWNLOAD PAGE
        // =========================

        const { data: downloadHtml } =
            await axios.get(downloadUrl);

        const $$ = cheerio.load(downloadHtml);

        const tracks = [];

        $$("a").each((i, el) => {

            const href = $$(el).attr("href");

            if (href && href.endsWith(".mp3")) {

                tracks.push({

                    title: decodeURIComponent(href)
                        .replace(".mp3", ""),

                    url: downloadUrl + href
                });
            }
        });

        // =========================
        // ALBUM DATA FINAL
        // =========================

        const albumData = {

            album: albumName,

            artist: "Desconhecido",

            server: "internet-archive",

            genrer: "Rock",

            author: creator,

            cover: cover?.startsWith('http')
                ? cover
                : 'https://archive.org' + cover,

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
