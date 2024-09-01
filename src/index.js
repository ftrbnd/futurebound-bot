import { env } from './utils/env.js';
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';
import { client } from './bot.js';
import { connectToDb } from './lib/mongo/index.js';
import { registerHeardleJobs } from './lib/heardle/cron.js';
import { registerSocialsJobs } from './lib/socials/cron.js';
import { sendMessageInLogChannel } from './utils/error-handler.js';

ffmpeg.setFfmpegPath(ffmpegPath);

async function start() {
  try {
    await client.login(env.DISCORD_TOKEN);

    await connectToDb(client);
    await registerHeardleJobs(client);
    await registerSocialsJobs(client);
  } catch (error) {
    const logChannel = client.channels.cache.get(env.LOGS_CHANNEL_ID);
    await sendMessageInLogChannel(null, error, logChannel);
  }
}

start();
