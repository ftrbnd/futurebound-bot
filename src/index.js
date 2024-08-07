import { env } from './utils/env.js';
import { client } from './bot.js';
import { connectToDb } from './lib/mongo/index.js';
import { registerHeardleJobs } from './lib/heardle/cron.js';

client.login(env.DISCORD_TOKEN);

connectToDb(client);
registerHeardleJobs(client);
