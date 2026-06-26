//conexão com o banco de dados para uso global

import sqlite3 from 'sqlite3';
import { paths } from '../config/index.js';

sqlite3.verbose();

const db =
    new sqlite3.Database(paths.dbFile, (err) => {

        if (err) {
            console.error('❌ erro banco:', err);
        } else {
            console.log('✅ banco conectado');
        }

    });

function run(sql) {
    return new Promise((resolve, reject) => {
        db.run(sql, err => {
            if (err) {
                reject(err);
                return;
            }

            resolve();
        });
    });
}

function all(sql) {
    return new Promise((resolve, reject) => {
        db.all(sql, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(rows);
        });
    });
}

async function ensureColumnExists(tableName, columnName, columnType) {
    const columns =
        await all(`PRAGMA table_info(${tableName})`);

    if (columns.some(column => column.name === columnName)) {
        return;
    }

    await run(`
        ALTER TABLE ${tableName}
        ADD COLUMN ${columnName} ${columnType}
    `);

    console.log(`✅ coluna adicionada: ${tableName}.${columnName}`);
}

async function ensureDatabaseSchema() {
    try {
        await ensureColumnExists('albums', 'source_url', 'TEXT');
        await ensureColumnExists('playlists', 'source_url', 'TEXT');
    } catch (err) {
        console.error('❌ erro ao atualizar schema do banco:', err);
    }
}

void ensureDatabaseSchema();

export default db;
