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

    // remove caracteres invalidos

    const safeAlbum =
        albumData.album.replace(
            /[<>:"/\\|?*]/g,
            ''
        );

    const safeArtist =
        albumData.artist.replace(
            /[<>:"/\\|?*]/g,
            ''
        );

    fs.writeFileSync(
        path.join(
            paths.albumsJsonDir,
            `${safeAlbum} - ${safeArtist}.json`
        ),

        JSON.stringify(
            albumData,
            null,
            2
        )
    );

    console.log(
        '📁 JSON salvo:',
        `${safeAlbum} - ${safeArtist}`
    );
}

// =========================
// SCRAPER PALCO MP3
// =========================

export async function scrapePalco(url) {

    try {

        console.log(
            '🚀 carregando página...'
        );

        // =========================
        // HTML
        // =========================

        const { data: html } =
            await axios.get(url);

        const $ =
            cheerio.load(html);

        // =========================
        // ALBUM
        // =========================

        const album =
            $('h1')
                .first()
                .text()
                .trim();

        if (!album) {

            throw new Error(
                'album nao encontrado'
            );
        }

        // =========================
        // ARTIST
        // =========================

        const artist =
            $('a[title*="Ir para a página de"]')
                .first()
                .text()
                .trim();

        // =========================
        // COVER
        // =========================

        const cover =
            $('img')
                .first()
                .attr('src');

        // =========================
        // YEAR
        // =========================

        const infoText =
            $('h2')
                .first()
                .text();

        const yearMatch =
            infoText.match(
                /\b(19|20)\d{2}\b/
            );

        const year =
            yearMatch
                ? yearMatch[0]
                : '';

        // =========================
        // MUSIC NAMES
        // =========================

        const musicNames = [];

        $('a._6fBao._16Uya')
            .each((i, el) => {

                const title =
                    $(el)
                        .text()
                        .trim();

                if (title) {

                    musicNames.push(
                        title
                    );
                }
            });

        // =========================
        // MP3 URLS
        // =========================

        const mp3Regex =
            /https:\/\/[^"]+\.mp3/g;

        const mp3Matches =
            html.match(mp3Regex) || [];

        const uniqueMp3 =
            [...new Set(mp3Matches)];

        // =========================
        // TRACKS
        // =========================

        const tracks = [];

        uniqueMp3.forEach(
            (trackUrl, index) => {

                tracks.push({

                    title:
                        musicNames[index] ||
                        `Faixa ${index + 1}`,

                    url:
                        trackUrl.replace(
                            /\\/g,
                            ''
                        )
                });
            }
        );

        // =========================
        // JSON FINAL
        // =========================

        const albumData = {

            album,

            artist,

            server:
                'palco-mp3',

            genrer:
                'Rock',

            author:
                'Leo Miguins',

            year,

            cover,

            tracks
        };

        // =========================
        // EXPORT JSON (OPCIONAL)
        // =========================

        // 👉 descomente quando quiser salvar json
        // saveAlbumJson(albumData);

        return albumData;

    } catch (err) {

        console.log(err);

        return null;
    }
}
