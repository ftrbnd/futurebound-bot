import { env } from './utils/env.js';
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';
import { client } from './bot.js';
import { connectToDb } from './lib/mongo/index.js';
import { registerHeardleJobs } from './lib/heardle/cron.js';

ffmpeg.setFfmpegPath(ffmpegPath);

client.login(env.DISCORD_TOKEN);

connectToDb(client);
registerHeardleJobs(client);
