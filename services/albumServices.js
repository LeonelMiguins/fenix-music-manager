import {
    deleteAlbumTracksByAlbumId,
    deleteAlbumById,
    findAlbumById,
    findAlbumTracksById,
    findAllAlbums,
    insertAlbum,
    insertAlbumTracks,
    insertMusicIntoAlbum,
    updateAlbumById
} from '../repositories/albumRepository.js';

// =========================
// GET ALL
// =========================

export function getAlbums() {
    return findAllAlbums();

}

// =========================
// ADD
// =========================

export function addAlbum(album) {
    return createAlbum(album);

}

// =========================
// DELETE
// =========================

export function deleteAlbum(id) {
    return deleteAlbumById(id);

}

export async function createAlbum(album) {
    const result = await insertAlbum(album);
    const albumId = result.lastID;

    if (album.tracks && album.tracks.length > 0) {
        await insertAlbumTracks(albumId, album.tracks, album.artist);
    }

    return albumId;
}

export async function getAlbumById(id) {
    const album = await findAlbumById(id);

    if (!album) {
        return null;
    }

    const tracks = await findAlbumTracksById(id);

    return {
        ...album,
        tracks
    };
}

export async function addMusicToAlbum(albumId, music) {
    await insertMusicIntoAlbum(albumId, music);
}

export async function updateAlbum(albumId, album) {
    await updateAlbumById(albumId, album);
    await deleteAlbumTracksByAlbumId(albumId);

    if (album.tracks && album.tracks.length > 0) {
        await insertAlbumTracks(albumId, album.tracks, album.artist);
    }
}
