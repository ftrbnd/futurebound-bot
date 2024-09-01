import { Client } from 'discord.js';
import { env } from '../../utils/env.js';
import { sendMessageInLogChannel } from '../../utils/error-handler.js';

async function fetchUploads() {
  const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${env.YOUTUBE_CHANNEL_ID}&key=${env.YOUTUBE_API_KEY}`);
  if (!res.ok) throw new Error('Failed to fetch channel uploads playlist');

  const { items } = await res.json();
  return items[0].contentDetails.relatedPlaylists.uploads;
}

/**
 * @param {string} playlistId
 */
async function fetchVideos(playlistId) {
  const videos = [];
  let nextPageToken = null;

  do {
    const pageToken = nextPageToken ?? '';

    const res = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&key=${env.YOUTUBE_API_KEY}&pageToken=${pageToken}&maxResults=50`);
    if (!res.ok) throw new Error('Failed to fetch channel videos');

    const { items, nextPageToken: nextToken } = await res.json();
    videos.push(...items);
    nextPageToken = nextToken;
  } while (nextPageToken !== undefined);

  return videos;
}

/**
 * @param {Client<boolean>} discordClient
 */
export async function checkChannelUploads(discordClient) {
  try {
    const uploadsPlaylistId = await fetchUploads();
    const videos = await fetchVideos(uploadsPlaylistId);
  } catch (error) {
    const logChannel = discordClient.channels.cache.get(env.LOGS_CHANNEL_ID);
    await sendMessageInLogChannel(null, error, logChannel);
  }
}
