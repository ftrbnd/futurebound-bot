import { EmbedBuilder, ActivityType } from 'discord.js';
import { env } from '../utils/env.js';
import { ALL_SONGS, Colors } from '../utils/constants.js';
import { sendMessageInLogChannel } from '../utils/error-handler.js';

export const name = 'ready';
export const once = true;
export async function execute(client) {
  const logChannel = client.channels.cache.get(env.LOGS_CHANNEL_ID);

  try {
    let index = 0;
    let song = ALL_SONGS[index];

    client.user.setPresence({ activities: [{ name: song, type: ActivityType.Listening }] });

    setInterval(() => {
      song = ALL_SONGS[index >= ALL_SONGS.length - 1 ? 0 : ++index];

      client.user.setPresence({ activities: [{ name: song, type: ActivityType.Listening }] });
    }, 3 * 60 * 1000);

    const message = `**${client.user.tag}** is now ready`;

    if (logChannel && env.NODE_ENV !== 'development') {
      const readyEmbed = new EmbedBuilder().setDescription(message).setColor(Colors.CONFIRM);

      await logChannel.send({ embeds: [readyEmbed] });
    }

    console.log(`[Discord] ${client.user.tag} is now ready`);
  } catch (error) {
    await sendMessageInLogChannel(null, error, logChannel);
  }
}
