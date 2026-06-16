import path from 'path';
import { fileURLToPath } from 'url';

const __filename =
    fileURLToPath(import.meta.url);

const __dirname =
    path.dirname(__filename);

export const projectRoot =
    path.resolve(__dirname, '..');

export const appConfig = {
    port: 3060
};

export const paths = {
    projectRoot,
    webRoot: path.join(projectRoot, 'www'),
    webIndexFile: path.join(projectRoot, 'www', 'index.html'),
    dbDir: path.join(projectRoot, 'db'),
    dbFile: path.join(projectRoot, 'db', 'music.db'),
    dbBackupFile: path.join(projectRoot, 'db', 'music_backup.db'),
    tempDir: path.join(projectRoot, 'temp'),
    albumsJsonDir: path.join(projectRoot, 'albums_json')
};

export const files = {
    exportPrefix: 'fenix-backup-'
};

export function createExportFilePath(timestamp = Date.now()) {
    return path.join(
        paths.tempDir,
        `${files.exportPrefix}${timestamp}.json`
    );
}
