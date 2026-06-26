import {
    deletePlaylistById,
    deletePlaylistTracksByPlaylistId,
    findAllPlaylists,
    findPlaylistById,
    findPlaylistByMetadata,
    findPlaylistBySourceUrl,
    findPlaylistTracksById,
    insertMusicIntoPlaylist,
    insertPlaylist,
    insertPlaylistTracks,
    updatePlaylistById,
    updatePlaylistTrackById
} from '../repositories/playlistRepository.js';

export async function getPlaylists() {
    return findAllPlaylists();
}

export async function createPlaylist(playlist) {
    const result = await insertPlaylist(playlist);
    const playlistId = result.lastID;

    if (playlist.tracks && playlist.tracks.length > 0) {
        await insertPlaylistTracks(
            playlistId,
            playlist.tracks,
            playlist.artist,
            playlist.cover
        );
    }

    return playlistId;
}

export async function removePlaylist(id) {
    await deletePlaylistById(id);
}

export async function getPlaylistById(id) {
    const playlist = await findPlaylistById(id);

    if (!playlist) {
        return null;
    }

    const tracks = await findPlaylistTracksById(id);

    return {
        ...playlist,
        tracks
    };
}

export async function addMusicToPlaylist(playlistId, music) {
    await insertMusicIntoPlaylist(playlistId, music);
}

export async function updatePlaylist(playlistId, playlist) {
    await updatePlaylistById(playlistId, playlist);
    await deletePlaylistTracksByPlaylistId(playlistId);

    if (playlist.tracks && playlist.tracks.length > 0) {
        await insertPlaylistTracks(
            playlistId,
            playlist.tracks,
            playlist.artist,
            playlist.cover
        );
    }
}

export async function updatePlaylistTrack(trackId, music) {
    await updatePlaylistTrackById(trackId, music);
}

export async function getPlaylistBySourceUrl(sourceUrl) {
    if (!sourceUrl) {
        return null;
    }

    return findPlaylistBySourceUrl(sourceUrl);
}

export async function findPlaylistDuplicateCandidate(playlist) {
    const existingBySourceUrl =
        await getPlaylistBySourceUrl(
            playlist?.sourceUrl || playlist?.source_url || ''
        );

    if (existingBySourceUrl) {
        return existingBySourceUrl;
    }

    if (!playlist?.album || !playlist?.server || !playlist?.artist) {
        return null;
    }

    return findPlaylistByMetadata(
        playlist.album,
        playlist.server,
        playlist.artist
    );
}
