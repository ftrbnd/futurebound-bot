import db from 'mongoose';
import { registerDatabaseChecks } from './cron.js';
import { env } from '../../utils/env.js';

export async function connectToDb(discordClient) {
  try {
    const m = await db.connect(env.MONGODB_URI);
    m.set('strictQuery', true);
    console.log(`[Mongo] Connected to ${m.connections[0].name}`);

    registerDatabaseChecks(discordClient);
  } catch (error) {
    console.error(error);
    throw error;
  }
}
