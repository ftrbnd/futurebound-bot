import { CronJob } from 'cron';
import { Client } from 'discord.js';
import { checkArtistReleases } from './spotify.js';
import { checkChannelUploads } from './youtube.js';

/**
 * @param {Client<boolean>} discordClient
 */
export const registerSocialsJobs = async (discordClient) => {
  const spotifyJob = new CronJob('* * * * *', async () => checkArtistReleases(discordClient), null, true, 'utc');
  const youtubeJob = new CronJob('* * * * *', async () => checkChannelUploads(discordClient), null, true, 'utc');

  return [spotifyJob, youtubeJob];
};
