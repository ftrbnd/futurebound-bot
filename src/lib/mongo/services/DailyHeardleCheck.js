import { DailyHeardleCheck } from '../schemas/DailyHeardleCheck.js';

export async function createDailyHeardleCheck(fields) {
  const check = await DailyHeardleCheck.create(fields);
  return check;
}

export async function getDailyHeardleCheck(fields) {
  const check = await DailyHeardleCheck.findOne(fields);
  return check;
}

/**
 *
 * @param {number} nextDay
 * @param {string} nextSong
 */
export async function updateDailyHeardleCheck(nextDay, nextSong) {
  await DailyHeardleCheck.findOneAndUpdate(
    {},
    {
      nextDay,
      nextSong
    }
  );
}

export async function deleteAllChecks() {
  await DailyHeardleCheck.deleteMany({});
}

export async function updateAttemptCount() {
  const check = await DailyHeardleCheck.findOne({});
  const attempts = (check.attempts ?? 0) + 1;

  check.attempts = attempts;
  await check.save();

  return attempts;
}
