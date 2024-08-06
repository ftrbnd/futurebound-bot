const db = require('mongoose');
const { registerDatabaseChecks } = require('./cron');

async function connectToDb() {
  try {
    db.set('strictQuery', true);

    const m = await db.connect(process.env.MONGODB_URI);
    console.log(`[Mongo] Connected to ${m.connections[0].name}`);

    registerDatabaseChecks();
  } catch (error) {
    console.error(error);
  }
}

// TODO: create /services folder to wrap db calls
module.exports = { connectToDb };
