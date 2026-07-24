import { EmbedBuilder, ThreadAutoArchiveDuration } from 'discord.js';
import { env } from '../../utils/env.js';
import { Colors, EDEN_LOGO, HEARDLE_URL } from '../../utils/constants.js';

/**
 * Posts the daily Heardle announcement embed + discussion thread.
 * @param {import('discord.js').Guild} guild
 * @param {{ dayNumber: string | number, previousSong: string }} options
 */
export async function sendDailyHeardleAnnouncement(guild, { dayNumber, previousSong }) {
  const heardleChannel = guild.channels.cache.get(env.HEARDLE_CHANNEL_ID);
  if (!heardleChannel) throw new Error('Heardle channel not found');

  const notificationRole = guild.roles.cache.get(env.HEARDLE_ROLE_ID);

  const lastThread = heardleChannel.threads.cache.last();
  if (lastThread && !lastThread.locked) {
    await lastThread.setLocked(true);
  }

  const heardleEmbed = new EmbedBuilder()
    .setTitle(`EDEN Heardle #${dayNumber} - New daily song!`)
    .setURL(HEARDLE_URL)
    .setDescription(`Yesterday's song was **${previousSong}**`)
    .setThumbnail(EDEN_LOGO)
    .setColor(Colors.HEARDLE)
    .setFooter({
      text: 'Share your results in the thread!',
      iconURL: guild.iconURL({ dynamic: true })
    });

  const dailyMessage = await heardleChannel.send({ content: `${notificationRole}`, embeds: [heardleEmbed] });

  await dailyMessage.startThread({
    name: `EDEN Heardle #${dayNumber}`,
    autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
    reason: 'New daily Heardle song'
  });

  return dailyMessage;
}
