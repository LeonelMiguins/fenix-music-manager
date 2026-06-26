import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { paths } from '../config/index.js';

sqlite3.verbose();

// cria pasta db
fs.mkdirSync(
    paths.dbDir,
    { recursive: true }
);

function run(db, sql) {
    return new Promise((resolve, reject) => {

        db.run(sql, function (err) {

            if (err) reject(err);
            else resolve(this);

        });

    });
}

function get(db, sql) {
    return new Promise((resolve, reject) => {

        db.get(sql, (err, row) => {

            if (err) reject(err);
            else resolve(row);

        });

    });
}

function initDb() {

    return new Promise(async (resolve, reject) => {

        const db = new sqlite3.Database(paths.dbFile);

        try {

            console.log('🚀 criando banco...');

            await run(db, 'PRAGMA foreign_keys = ON');

            // =========================
            // albums
            // =========================

            await run(db, `
                CREATE TABLE IF NOT EXISTS albums (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    artista_nome TEXT,
                    artista_relacionado,
                    titulo TEXT,
                    ano TEXT,
                    genero TEXT,
                    descricao TEXT,
                    cover TEXT,
                    servidor TEXT,
                    autor TEXT,
                    source_url TEXT
                )
            `);

            // =========================
            // MUSICAS
            // =========================

            await run(db, `
                CREATE TABLE IF NOT EXISTS musicas (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,

                    album_id INTEGER,
                    titulo TEXT,
                    url TEXT,
                    artista TEXT,

                    FOREIGN KEY (album_id)
                    REFERENCES albums(id)
                    ON DELETE CASCADE
                )
            `);

            // =========================
            // PLAYLISTS
            // =========================

            await run(db, `
                CREATE TABLE IF NOT EXISTS playlists (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    artista_nome TEXT,
                    artista_relacionado,
                    titulo TEXT,
                    ano TEXT,
                    genero TEXT,
                    descricao TEXT,
                    cover TEXT,
                    servidor TEXT,
                    autor TEXT,
                    source_url TEXT
                )
            `);

            // =========================
            // PLAYLIST MUSICAS
            // =========================

            await run(db, `
                CREATE TABLE IF NOT EXISTS playlists_musicas (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,

                    playlist_id INTEGER,
                    titulo TEXT,
                    artista TEXT,
                    url TEXT,
                    cover TEXT,

                    FOREIGN KEY (playlist_id)
                    REFERENCES playlists(id)
                    ON DELETE CASCADE
                )
            `);

            // =========================
            // CHECA SE JA TEM DADOS
            // =========================

            const row =
                await get(
                    db,
                    'SELECT COUNT(*) as count FROM albums'
                );

            if (row.count > 0) {

                console.log('✅ banco já populado');

                db.close();

                return resolve();
            }

            console.log('🌱 populando banco...');

            // =========================
            // ALBUM
            // =========================

            await run(db, `
                INSERT INTO albums (
                    artista_nome,
                    artista_relacionado,
                    titulo,
                    ano,
                    genero,
                    descricao,
                    cover,
                    servidor,
                    autor
                )
                VALUES (
                    'Independente',
                    '[1, 25]',
                    'Sombras da Guerra',
                    '1994',
                    '["Rock", "Metal", "Pop"]',
                    'Álbum épico',
                    'https://artist99.cdn107.com/90a/90a1bab4054b8dc7d714d826b79e3006_lg.jpg',
                    'Local',
                    'Leo'
                )
            `);

            // =========================
            // MUSICAS
            // =========================

            await run(db, `
                INSERT INTO musicas (
                    album_id,
                    titulo,
                    url,
                    artista
                )
                VALUES

                (
                    1,
                    'Chamas Eternas',
                    'https://m4a-64.jango.com/43/03/46/4303468333325401379.m4a',
                    '["Rock Doido", "Jabuticaba Rock"]'
                ),

                (
                    1,
                    'Eco das Ruínas',
                    'https://m4a-64.jango.com/25/94/88/2594883900153723657.m4a',
                    'macaco reumatico'
                ),

                (
                    1,
                    'Brilho Noturno',
                    'https://m4a-64.jango.com/22/48/20/2248207164423705543.m4a',
                    'jeba mole'
                )
            `);

            // =========================
            // PLAYLIST
            // =========================

            await run(db, `
                INSERT INTO playlists (
                    artista_nome,
                    artista_relacionado,
                    titulo,
                    ano,
                    genero,
                    descricao,
                    cover,
                    servidor,
                    autor
                )
                VALUES (
                    'Samuel, Nathalia, Judas...',
                    '3',
                    'Minhas favoritas',
                    '2019',
                    'Rock',
                    'Arrebenta coração',
                    'https://dn711103.ca.archive.org/0/items/rami-rez-1036544-rami-rez/Contracapa.jpg',
                    'spotify',
                    'Leo'
                )
            `);

            // =========================
            // PLAYLIST MUSICAS
            // =========================

            await run(db, `
                INSERT INTO playlists_musicas (
                    playlist_id,
                    titulo,
                    artista,
                    url,
                    cover
                )
                VALUES (
                    1,
                    'Uma noite de Luar',
                    'Independente do amanhã',
                    'https://m4a-64.jango.com/22/48/20/2248207164423705543.m4a',
                    'https://dn711103.ca.archive.org/0/items/rami-rez-1036544-rami-rez/Contracapa.jpg'
                )
            `);

            console.log('✅ seed concluído');

            db.close();

            resolve();

        } catch (err) {

            db.close();

            reject(err);
        }

    });

}

export default initDb;


initDb()
    .then(() => {
        console.log('✅ banco criado');
    })
    .catch(err => {
        console.error('❌ erro:', err);
    });
