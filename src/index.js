import dotenv from 'dotenv';
dotenv.config();

import { client } from './bot.js';
import { connectToDb } from './lib/mongo/index.js';
import { registerHeardleJobs } from './lib/heardle/cron.js';

client.login(process.env.DISCORD_TOKEN);

connectToDb(client);
registerHeardleJobs(client);
