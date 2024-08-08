import { Document } from 'mongoose';
import { SurvivorRound } from '../schemas/SurvivorRound.js';

export async function createSurvivorRound(fields) {
  const round = await SurvivorRound.create(fields);
  return round;
}

export async function getSurvivorRound(fields) {
  const round = await SurvivorRound.findOne(fields);
  return round;
}

/**
 *
 * @param {Document<SurvivorRound>} round
 * @param {string} userId
 */
export async function removeDuplicateVote(round, userId) {
  let ogVote = '';
  let changedSong = false;

  round.votes.forEach((userIds, song) => {
    if (userIds.includes(userId)) {
      ogVote = song;
      userIds.splice(userIds.indexOf(userId), 1); // remove the user's id from the original song's vote list
      changedSong = true;
    }
  });

  await round.save();

  return { ogVote, changedSong };
}

/**
 *
 * @param {Document<SurvivorRound>} round
 * @param {string} song
 * @param {string[]} votes
 */
export async function updateVotes(round, song, votes) {
  round.votes.set(song, votes); // add the new votes list to the database

  await round.save();
}

/**
 *
 * @param {Document<SurvivorRound>} round
 * @param {string} lastMessageId
 * @param {number} roundNumber
 */
export async function updateRoundAfterSend(round, lastMessageId, roundNumber) {
  round.lastMessageId = lastMessageId;
  round.roundNumber = roundNumber;

  await round.save();
}
