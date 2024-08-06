import { User } from '../schemas/User.js';

export async function createUser(fields) {
  const user = await User.create(fields);
  return user;
}

export async function getUser(fields) {
  const user = await User.findOne(fields);
  return user;
}

export async function getUsers() {
  const users = await User.find({});
  return users;
}

/**
 *
 * @param {User} user
 * @param {Date} muteEnd
 * @param {string} username
 */
export async function updateUserMute(user, muteEnd, username) {
  user.muteEnd = muteEnd;
  user.username = username;

  await user.save();
}

/**
 *
 * @param {User} user
 * @param {string} username
 * @param {Date} birthday
 * @param {string} timezone
 */
export async function updateUserBirthday(user, username, birthday, timezone) {
  user.username = username;
  user.birthday = birthday;
  user.timezone = timezone;

  await user.save();
}

/**
 *
 * @param {User} user
 * @param {string} username
 * @param {number} warnings
 */
export async function updateUserWarning(user, username, warnings) {
  user.username = username;
  user.warnings = warnings;

  await user.save();
}
