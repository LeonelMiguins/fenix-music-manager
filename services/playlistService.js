import {
    deletePlaylistById,
    findAllPlaylists,
    findPlaylistById,
    findPlaylistTracksById,
    insertMusicIntoPlaylist,
    insertPlaylist,
    insertPlaylistTracks
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
