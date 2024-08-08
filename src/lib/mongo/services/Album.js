import { Document } from 'mongoose';
import { Album } from '../schemas/Album.js';

export async function createAlbum(fields) {
  const album = await Album.create(fields);
  return album;
}

export async function getAlbum(fields) {
  const album = await Album.findOne(fields);
  return album;
}

/**
 *
 * @param {Document<Album>} album
 * @param {*} track
 */
export async function removeTrack(album, track) {
  album.tracks.pull(track);
  const updatedAlbum = await album.save();

  return updatedAlbum;
}

/**
 *
 * @param {Document<Album>} album
 * @param {*[]} tracks
 */
export async function resetTracks(album, tracks) {
  album.tracks = tracks;
  const updatedAlbum = await album.save();

  return updatedAlbum;
}
