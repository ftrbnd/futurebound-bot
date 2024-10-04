import { Token } from '../schemas/Token.js';

/**
 * @param {string} service
 */
export async function getServiceToken(service) {
  const token = await Token.findOne({ service });

  return token;
}

/**
 * @param {string} service
 * @param {{
 *      access_token: string,
 *      token_type: string,
 *      expires_at: Date
 * }} data
 */
export async function saveServiceToken(service, data) {
  const newToken = await Token.findOneAndUpdate({ service }, data, {
    upsert: true,
    returnOriginal: false
  });

  return newToken;
}
