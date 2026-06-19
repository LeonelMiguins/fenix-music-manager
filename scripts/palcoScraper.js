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

function cleanText(value = '') {
    return value
        .replace(/\s+/g, ' ')
        .trim();
}

function getTrackPairsFromRows($) {
    const tracks = [];
    const seen = new Set();

    $('li, tr, div').each((_, element) => {
        const row =
            $(element);

        const rowText =
            cleanText(row.text());

        if (
            !rowText ||
            !/plays?/i.test(rowText)
        ) {
            return;
        }

        const anchors =
            row.find('a');

        if (anchors.length < 2) {
            return;
        }

        const title =
            cleanText(
                $(anchors[0]).text()
            );

        const artist =
            cleanText(
                $(anchors[1]).text()
            );

        if (!title || !artist) {
            return;
        }

        if (
            /^(m[uú]sicas?|artista|plays?)$/i.test(title) ||
            /^(m[uú]sicas?|artista|plays?)$/i.test(artist)
        ) {
            return;
        }

        const key =
            `${title}::${artist}`;

        if (seen.has(key)) {
            return;
        }

        seen.add(key);

        tracks.push({
            title,
            artist
        });
    });

    return tracks;
}

function inferPalcoType(url) {
    return url.includes('/playlist/')
        ? 'playlist'
        : 'album';
}

export async function scrapePalco(url) {

    try {

        const palcoType =
            inferPalcoType(url);

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
        const musicArtists = [];

        if (palcoType === 'playlist') {
            const trackPairs =
                getTrackPairsFromRows($);

            trackPairs.forEach(track => {
                musicNames.push(track.title);
                musicArtists.push(track.artist);
            });
        } else {
            $('a._6fBao._16Uya')
                .each((i, el) => {
                    const title =
                        cleanText(
                            $(el).text()
                        );

                    if (title) {
                        musicNames.push(title);
                    }
                });
        }

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

                    artist:
                        palcoType === 'playlist'
                            ? (musicArtists[index] || artist)
                            : artist,

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

            type:
                palcoType,

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
