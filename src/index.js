require('dotenv').config();

const { client } = require('./bot');
const { connectToDb } = require('./lib/mongo');
const { registerHeardleJobs } = require('./lib/heardle/cron');

client.login(process.env.DISCORD_TOKEN);

connectToDb(client);
registerHeardleJobs(client);
