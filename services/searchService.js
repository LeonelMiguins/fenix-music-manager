import { searchAlbums } from '../repositories/albumRepository.js';
import { searchPlaylists } from '../repositories/playlistRepository.js';

export async function searchLibrary(query) {
    if (!query) {
        return [];
    }

    const search = `%${query}%`;
    const [albums, playlists] = await Promise.all([
        searchAlbums(search),
        searchPlaylists(search)
    ]);

    return [
        ...albums,
        ...playlists
    ];
}
