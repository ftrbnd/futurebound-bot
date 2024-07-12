require('dotenv').config();

const { client } = require('./bot');
const { registerDatabaseChecks } = require('./lib/mongoDB');
const { registerPrevHeardleCheck, registerNextHeardleCheck } = require('./lib/cron');
require('./lib/redis');

client.login(process.env.DISCORD_TOKEN);

registerDatabaseChecks(client);

registerPrevHeardleCheck();
registerNextHeardleCheck(client);
