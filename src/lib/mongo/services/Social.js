import { Social } from '../schemas/Social.js';

/**
 * @param {'spotify' | 'youtube'} type
 */
export async function getSocialCollection(type) {
  const albums = await Social.find({ type });

  return albums;
}

/**
 * @param {'spotify' | 'youtube'} type
 * @param {string} socialId
 * @param {string} title
 */
export async function addSocialItem(type, socialId, title) {
  const newSocialItem = await Social.create({
    type,
    socialId,
    title
  });

  return newSocialItem;
}
