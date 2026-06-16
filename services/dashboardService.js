import {
    countAlbums,
    countAlbumTracks,
    countPlaylists,
    countPlaylistTracks,
    findLibrarySources,
    findRecentAlbums,
    findRecentPlaylists
} from '../repositories/dashboardRepository.js';

export async function getDashboardSummary() {
    const [
        albumsRow,
        playlistsRow,
        albumTracksRow,
        playlistTracksRow,
        recentAlbums,
        recentPlaylists,
        sources
    ] = await Promise.all([
        countAlbums(),
        countPlaylists(),
        countAlbumTracks(),
        countPlaylistTracks(),
        findRecentAlbums(),
        findRecentPlaylists(),
        findLibrarySources()
    ]);

    const stats = {
        albums: albumsRow.total,
        playlists: playlistsRow.total,
        tracks: albumTracksRow.total + playlistTracksRow.total,
        libraryItems: albumsRow.total + playlistsRow.total
    };

    const recentItems = [
        ...recentAlbums,
        ...recentPlaylists
    ]
        .sort((a, b) => b.id - a.id)
        .slice(0, 6);

    return {
        stats,
        recentItems,
        sources
    };
}
