import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { CronJob } from 'cron';
import { getCurrentDailySong } from './api.js';
import { createDailyHeardleCheck, deleteAllChecks, getDailyHeardleCheck, updateDailyHeardleCheck } from '../mongo/services/DailyHeardleCheck.js';
import { getLatestSuccessfulDailyWebhook, wasDailyAnnouncementSent } from './daily-announcement.js';
import { env } from '../../utils/env.js';
import { Colors } from '../../utils/constants.js';

async function snapshotPrev() {
  try {
    const { song: prev } = await getCurrentDailySong();

    await deleteAllChecks();

    await createDailyHeardleCheck({
      prevDay: prev.heardleDay,
      prevSong: prev.name
    });
  } catch (error) {
    console.error(error);
  }
}

async function snapshotNext(client) {
  try {
    const { song: next } = await getCurrentDailySong();

    await updateDailyHeardleCheck(next.heardleDay, next.name);

    const status = await getDailyHeardleCheck({});
    console.log({ dailyHeardleCheck: status });

    if (status.prevDay === status.nextDay) {
      const server = await client.guilds.cache.get(env.GUILD_ID);
      const owner = await server.fetchOwner();

      const embed = new EmbedBuilder()
        .addFields([
          { name: 'Previous Day', value: `${status.prevDay}` },
          { name: 'Previous Song', value: `${status.prevSong}` },
          { name: 'Next Day', value: `${status.nextDay}` },
          { name: 'Next Song', value: `${status.nextSong}` },
          { name: 'Retry Attempts', value: `${status.attempts ?? 0}` }
        ])
        .setColor(Colors.ERROR);

      const retryButton = new ButtonBuilder().setCustomId(`retry_daily_heardle_${status.id}`).setLabel('Retry').setStyle(ButtonStyle.Primary);
      const disableButton = new ButtonBuilder().setCustomId(`disable_daily_heardle_${status.id}`).setLabel('Disable').setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents(retryButton, disableButton);

      await owner.send({ content: 'Daily Heardle failed to run', embeds: [embed], components: [row] });
    }
  } catch (error) {
    console.error(error);
  }
}

async function verifyDailyAnnouncement(client) {
  try {
    const server = client.guilds.cache.get(env.GUILD_ID);
    if (!server) return;

    let dayNumber;
    let previousSong;

    try {
      const { song } = await getCurrentDailySong();
      dayNumber = song.heardleDay;
    } catch (error) {
      console.error('Failed to fetch current daily song for announcement check:', error);
    }

    try {
      const webhook = await getLatestSuccessfulDailyWebhook(server);
      dayNumber ??= webhook.dayNumber;
      previousSong = webhook.previousSong;
    } catch (error) {
      console.error('Failed to read Heardle webhook for announcement check:', error);
    }

    if (dayNumber == null) {
      const owner = await server.fetchOwner();
      await owner.send({
        content: 'Could not verify the daily Heardle announcement — no day number found from the API or logs webhook.'
      });
      return;
    }

    const sent = await wasDailyAnnouncementSent(server, dayNumber);
    if (sent) {
      console.log(`Daily Heardle #${dayNumber} announcement verified`);
      return;
    }

    const owner = await server.fetchOwner();
    const embed = new EmbedBuilder()
      .setTitle('Daily Heardle announcement missing')
      .addFields([
        { name: 'Day Number', value: `${dayNumber}` },
        ...(previousSong ? [{ name: 'Previous Song', value: previousSong }] : [])
      ])
      .setColor(Colors.ERROR);

    const announceButton = new ButtonBuilder().setCustomId('announce_daily_heardle').setLabel('Announce').setStyle(ButtonStyle.Primary);
    const row = new ActionRowBuilder().addComponents(announceButton);

    await owner.send({
      content: `Daily Heardle #${dayNumber} announcement was not found in the Heardle channel.`,
      embeds: [embed],
      components: [row]
    });
  } catch (error) {
    console.error(error);
  }
}

export const registerHeardleJobs = async (client) => {
  // 8:55 pm PT
  const prevCron = new CronJob(`55 3 * * *`, async () => snapshotPrev(), null, true, 'utc');

  // 9:05 pm PT
  const nextCron = new CronJob(`5 4 * * *`, async () => snapshotNext(client), null, true, 'utc');

  // 9:15 pm PT — verify Discord announcement was posted
  const verifyCron = new CronJob(`15 4 * * *`, async () => verifyDailyAnnouncement(client), null, true, 'utc');

  return [prevCron, nextCron, verifyCron];
};
