import { Client, EmbedBuilder } from 'discord.js';
import { env } from '../../utils/env.js';
import { addSocialItem, getSocialCollection } from '../mongo/services/Social.js';
import { Colors } from '../../utils/constants.js';
import { sendMessageInLogChannel } from '../../utils/error-handler.js';
import { getServiceToken, saveServiceToken } from '../mongo/services/Token.js';
import { checkSocialCronSettings } from '../mongo/services/Settings.js';

/**
 * @returns {Promise<{
 *    access_token: string,
 *    token_type: string,
 *    expires_in: number
 * }>}
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
  if (!res.ok) throw new Error('Spotify: Failed to fetch access token');

  const data = await res.json();
  return data;
}

async function getToken() {
  let token = await getServiceToken('spotify');
  const now = new Date();

  if (!token || token.expires_at.getTime() < now.getTime()) {
    const data = await getTokenWithClientCredentials();
    const expires_at = new Date(new Date().getTime() + data.expires_in * 1000);

    token = await saveServiceToken('spotify', {
      access_token: data.access_token,
      token_type: data.token_type,
      expires_at
    });
  } // else we have a valid token

  return token.access_token;
}

/**
 * @returns The artist's albums from the Spotify Web API
 */
async function fetchArtistAlbums() {
  const token = await getToken();

  const albums = [];
  let nextPage = null;

  do {
    const res = await fetch(nextPage ?? `https://api.spotify.com/v1/artists/${env.SPOTIFY_ARTIST_ID}/albums`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (res.status === 401) throw new Error('Spotify: Bad or expired token');
    if (res.status === 403) throw new Error('Spotify: Bad OAuth request');
    if (res.status === 429) throw new Error('Spotify: Rate limit exceeded');
    if (!res.ok) throw new Error(`Spotify: Failed to get artist's albums`);

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
    const { spotifyCronEnabled } = await checkSocialCronSettings();
    if (!spotifyCronEnabled) return;

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

        await announcementChannel.send({ content: `# ${item.name} is out now!`, embeds: [embed] });

        await addSocialItem('spotify', item.id, item.name);
      }
    }
  } catch (error) {
    const logChannel = discordClient.channels.cache.get(env.LOGS_CHANNEL_ID);
    await sendMessageInLogChannel(null, error, logChannel);
  }
}
