import { Document } from 'mongoose';
import { Playlist } from '../schemas/Playlist';

export async function getPlaylist(fields) {
  const playlist = await Playlist.findOne(fields);
  return playlist;
}

export async function getPlaylistChoices() {
  const playlists = await Playlist.find({});

  const choices = playlists.map((playlist) => [playlist.name, playlist.link]);

  return choices;
}

export async function createPlaylist(fields) {
  const playlist = await Playlist.create(fields);
  return playlist;
}

/**
 *
 * @param {Document<Playlist>} playlist
 * @param {string} link
 */
export async function updatePlaylistLink(playlist, link) {
  playlist.link = link;
  await playlist.save();
}
