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

export default db;
