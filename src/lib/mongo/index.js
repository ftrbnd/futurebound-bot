import db from 'mongoose';
import { registerDatabaseChecks } from './cron.js';

export async function connectToDb(discordClient) {
  try {
    db.set('strictQuery', true);

    const m = await db.connect(process.env.MONGODB_URI);
    console.log(`[Mongo] Connected to ${m.connections[0].name}`);

    registerDatabaseChecks(discordClient);
  } catch (error) {
    console.error(error);
  }
}

// TODO: create /services folder to wrap db calls
