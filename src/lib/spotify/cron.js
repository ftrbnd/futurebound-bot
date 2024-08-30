import { CronJob } from 'cron';
import { Client } from 'discord.js';
import { checkArtistReleases } from './api.js';

/**
 * @param {Client<boolean>} discordClient
 */
export const registerSpotifyJob = async (discordClient) => {
  const job = new CronJob('* * * * *', async () => checkArtistReleases(discordClient), null, true, 'utc');

  return job;
};
