import { Document } from 'mongoose';
import { Giveaway } from '../schemas/Giveaway';

export async function createGiveaway(fields) {
  const giveaway = await Giveaway.create(fields);
  return giveaway;
}

export async function getGiveaways() {
  const giveaways = await Giveaway.find({});
  return giveaways;
}

export async function getGiveaway(fields) {
  const giveaway = await Giveaway.findOne(fields);
  return giveaway;
}

/**
 *
 * @param {Document<Giveaway>} giveaway
 * @param {string} userId
 * @param {number} entries
 */
export async function updateGiveawayEntries(giveaway, userId, entries) {
  for (let i = 0; i < entries; i++) {
    giveaway.entries.push(userId);
  }
  await giveaway.save();

  const extraEntries = entries - 1;
  const pluralCheck = extraEntries > 1 ? 'entries' : 'entry';

  const message = entries > 1 ? `Thank you for being a Server Subscriber, you get ${extraEntries} extra ${pluralCheck}! (${entries} total)` : 'Entry confirmed!';
  return message;
}
