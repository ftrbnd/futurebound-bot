import { EmbedBuilder, ThreadAutoArchiveDuration } from 'discord.js';
import { env } from '../../utils/env.js';
import { Colors, EDEN_LOGO, HEARDLE_URL } from '../../utils/constants.js';

/**
 * Finds the latest successful daily Heardle webhook in the logs channel.
 * @param {import('discord.js').Guild} guild
 * @returns {Promise<{ previousSong: string, dayNumber: string, message: import('discord.js').Message }>}
 */
export async function getLatestSuccessfulDailyWebhook(guild) {
  const logChannel = guild.channels.cache.get(env.LOGS_CHANNEL_ID);
  if (!logChannel) throw new Error('Logs channel not found.');

  const messages = await logChannel.messages.fetch({ limit: 100 });
  const webhookMessage = messages.find((message) => {
    if (message.webhookId !== env.HEARDLE_WEBHOOK_ID || !message.embeds[0]) return false;

    const title = (message.embeds[0].title ?? '').toLowerCase();
    const description = (message.embeds[0].description ?? '').toLowerCase();
    return title.includes('daily') && description.includes('successfully');
  });

  if (!webhookMessage) {
    throw new Error('No successful daily Heardle webhook message found in the logs channel.');
  }

  const previousSong = webhookMessage.embeds[0].fields[0]?.value;
  const dayNumber = webhookMessage.embeds[0].fields[1]?.value;

  if (!previousSong || dayNumber == null) {
    throw new Error('Could not read previous song or day number from the Heardle webhook embed.');
  }

  return { previousSong, dayNumber, message: webhookMessage };
}

/**
 * Checks whether the daily announcement embed for a given day was posted.
 * @param {import('discord.js').Guild} guild
 * @param {string | number} dayNumber
 */
export async function wasDailyAnnouncementSent(guild, dayNumber) {
  const heardleChannel = guild.channels.cache.get(env.HEARDLE_CHANNEL_ID);
  if (!heardleChannel) throw new Error('Heardle channel not found');

  const messages = await heardleChannel.messages.fetch({ limit: 25 });
  const expectedTitle = `EDEN Heardle #${dayNumber}`;

  return messages.some(
    (message) => message.author.id === env.DISCORD_CLIENT_ID && message.embeds[0]?.title?.includes(expectedTitle)
  );
}

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
