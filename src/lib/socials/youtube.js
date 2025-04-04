import { Client, EmbedBuilder } from 'discord.js';
import { env } from '../../utils/env.js';
import { sendMessageInLogChannel } from '../../utils/error-handler.js';
import { addSocialItem, getSocialCollection } from '../mongo/services/Social.js';
import { Colors } from '../../utils/constants.js';
import { checkSocialCronSettings } from '../mongo/services/Settings.js';

async function fetchUploads() {
  const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${env.YOUTUBE_CHANNEL_ID}&key=${env.YOUTUBE_API_KEY}`);
  if (!res.ok) throw new Error('Failed to fetch channel uploads playlist');

  const { items } = await res.json();
  return items[0].contentDetails.relatedPlaylists.uploads;
}

async function fetchVideos() {
  const uploadsPlaylistId = await fetchUploads();

  const videos = [];
  let nextPageToken = null;

  do {
    const pageToken = nextPageToken ?? '';

    const res = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&key=${env.YOUTUBE_API_KEY}&pageToken=${pageToken}&maxResults=50`);
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
  // TODO: filter out Shorts
  try {
    const { youtubeCronEnabled } = await checkSocialCronSettings();
    if (!youtubeCronEnabled) return;

    const currentVideos = await fetchVideos();
    const previousVideos = await getSocialCollection('youtube');

    for (const item of currentVideos) {
      const title = item.snippet.title;
      const videoId = item.snippet.resourceId.videoId;

      const videoExists = previousVideos.some((album) => album.socialId === videoId);
      if (!videoExists) {
        const announcementChannel = discordClient.channels.cache.get(env.ANNOUNCEMENTS_CHANNEL_ID);

        const embed = new EmbedBuilder()
          .setTitle(title)
          .setURL(`https://youtube.com/watch?v=${videoId}`)
          .setDescription(item.snippet.description.split('\n')[0])
          .setThumbnail(item.snippet.thumbnails.maxres.url)
          .setColor(Colors.YOUTUBE);

        await announcementChannel.send({
          content: '## EDEN just uploaded a new video!',
          embeds: [embed]
        });

        await addSocialItem('youtube', videoId, title);
      }
    }
  } catch (error) {
    const logChannel = discordClient.channels.cache.get(env.LOGS_CHANNEL_ID);
    await sendMessageInLogChannel(null, error, logChannel);
  }
}
