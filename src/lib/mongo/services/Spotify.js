import { Spotify } from '../schemas/Spotify.js';

export async function getSpotifyAlbums() {
  const albums = await Spotify.find({});

  return albums;
}

/**
 * @param {string} spotifyId
 * @param {string} name
 */
export async function addSpotifyAlbum(spotifyId, name) {
  const newAlbum = await Spotify.create({
    spotifyId,
    name
  });

  return newAlbum;
}
