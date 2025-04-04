import { Settings } from '../schemas/Settings.js';

/**
 * @param {boolean} spotifyEnabled
 * @param {boolean} youtubeEnabled
 */
export async function setSocialCronSettings(spotifyEnabled, youtubeEnabled) {
  await Settings.findOneAndUpdate(
    {},
    {
      spotifyCronEnabled: spotifyEnabled,
      youtubeCronEnabled: youtubeEnabled
    },
    { upsert: true }
  );
}

export async function checkSocialCronSettings() {
  const settings = await Settings.findOne({}, {}, { upsert: true });

  return {
    spotifyCronEnabled: settings.spotifyCronEnabled,
    youtubeCronEnabled: settings.youtubeCronEnabled
  };
}
