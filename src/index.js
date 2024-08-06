require('dotenv').config();

const { client } = require('./bot');
const { registerDatabaseChecks } = require('./lib/mongoDB');
const { registerPrevHeardleCheck, registerNextHeardleCheck } = require('./lib/heardle/cron');

client.login(process.env.DISCORD_TOKEN);

registerDatabaseChecks(client);

registerPrevHeardleCheck();
registerNextHeardleCheck(client);
