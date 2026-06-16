import fs from 'fs';
import {
    createExportFilePath,
    paths
} from '../config/index.js';
import { exportDB } from './exportDb.js';

async function run() {
    const data =
        await exportDB();

    fs.mkdirSync(
        paths.tempDir,
        { recursive: true }
    );

    const filePath =
        createExportFilePath();

    fs.writeFileSync(
        filePath,
        JSON.stringify(data, null, 2)
    );

    console.log(`✅ exportado: ${filePath}`);
}

run().catch(err => {
    console.error('❌ erro ao exportar banco:', err);
    process.exit(1);
});
