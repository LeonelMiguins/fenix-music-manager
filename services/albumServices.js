import {
    deleteAlbumTracksByAlbumId,
    deleteAlbumById,
    findAlbumById,
    findAlbumByMetadata,
    findAlbumBySourceUrl,
    findAlbumTracksById,
    findAllAlbums,
    insertAlbum,
    insertAlbumTracks,
    insertMusicIntoAlbum,
    updateAlbumById,
    updateAlbumTrackById
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

export async function updateAlbumTrack(trackId, music) {
    await updateAlbumTrackById(trackId, music);
}

export async function getAlbumBySourceUrl(sourceUrl) {
    if (!sourceUrl) {
        return null;
    }

    return findAlbumBySourceUrl(sourceUrl);
}

export async function findAlbumDuplicateCandidate(album) {
    const existingBySourceUrl =
        await getAlbumBySourceUrl(
            album?.sourceUrl || album?.source_url || ''
        );

    if (existingBySourceUrl) {
        return existingBySourceUrl;
    }

    if (!album?.album || !album?.server || !album?.artist) {
        return null;
    }

    return findAlbumByMetadata(
        album.album,
        album.server,
        album.artist
    );
}
