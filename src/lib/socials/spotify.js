import { Client, EmbedBuilder } from 'discord.js';
import { env } from '../../utils/env.js';
import { addSocialItem, getSocialCollection } from '../mongo/services/Social.js';
import { Colors } from '../../utils/constants.js';
import { sendMessageInLogChannel } from '../../utils/error-handler.js';

/**
 * @returns {Promise<string>} Spotify access token
 */
async function getTokenWithClientCredentials() {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(env.SPOTIFY_CLIENT_ID + ':' + env.SPOTIFY_CLIENT_SECRET).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials'
    })
  });

  const { access_token } = await res.json();

  return access_token;
}

/**
 * @returns The artist's albums from the Spotify Web API
 */
async function fetchArtistAlbums() {
  const token = await getTokenWithClientCredentials();

  const albums = [];
  let nextPage = null;

  do {
    const res = await fetch(nextPage ?? `https://api.spotify.com/v1/artists/${env.SPOTIFY_ARTIST_ID}/albums`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error(`Failed to get artist's albums`);

    const { items, next } = await res.json();
    albums.push(...items);
    nextPage = next;
  } while (nextPage !== null);

  return albums;
}

/**
 * @param {Client<boolean>} discordClient
 */
export async function checkArtistReleases(discordClient) {
  try {
    const currentAlbums = await fetchArtistAlbums();
    const previousAlbums = await getSocialCollection('spotify');

    for (const item of currentAlbums) {
      const albumExists = previousAlbums.some((album) => album.socialId === item.id);

      if (!albumExists) {
        const announcementChannel = discordClient.channels.cache.get(env.ANNOUNCEMENTS_CHANNEL_ID);

        const artists = item.artists.map((artist) => artist.name).join(', ');

        const embed = new EmbedBuilder()
          .setTitle('New release on Spotify')
          .setURL(item.external_urls.spotify)
          .setDescription(`${artists} - ${item.name}`)
          .setThumbnail(item.images[0].url)
          .setColor(Colors.SPOTIFY);

        await announcementChannel.send({ content: `# ${item.name} is out now @everyone!`, embeds: [embed] });

        await addSocialItem('spotify', item.id, item.name);
      }
    }
  } catch (error) {
    const logChannel = discordClient.channels.cache.get(env.LOGS_CHANNEL_ID);
    await sendMessageInLogChannel(null, error, logChannel);
  }
}
