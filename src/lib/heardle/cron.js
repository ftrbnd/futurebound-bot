const DailyHeardleCheck = require('../mongo/schemas/DailyHeardleCheck');
const { CronJob } = require('cron');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getCurrentDailySong } = require('./api');

async function snapshotPrev() {
  const prev = await getCurrentDailySong();

  await DailyHeardleCheck.deleteMany({});

  await DailyHeardleCheck.create({
    prevDay: prev.heardleDay,
    prevSong: prev.name
  });
}

async function snapshotNext(client) {
  try {
    const next = await getCurrentDailySong();

    await DailyHeardleCheck.findOneAndUpdate(
      {},
      {
        nextDay: next.heardleDay,
        nextSong: next.name
      }
    );

    const status = await DailyHeardleCheck.findOne({});
    console.log({ dailyHeardleCheck: status });

    if (status.prevDay === status.nextDay) {
      const server = await client.guilds.cache.get(process.env.GUILD_ID);
      const owner = await server.fetchOwner();

      const embed = new EmbedBuilder()
        .addFields([
          { name: 'Previous Day', value: `${status.prevDay}` },
          { name: 'Previous Song', value: `${status.prevSong}` },
          { name: 'Next Day', value: `${status.nextDay}` },
          { name: 'Next Song', value: `${status.nextSong}` }
        ])
        .setColor(process.env.ERROR_COLOR);

      const retryButton = new ButtonBuilder().setCustomId(`retry_daily_heardle_${status.id}`).setLabel('Retry').setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(retryButton);

      await owner.send({ content: 'Daily Heardle failed to run', embeds: [embed], components: [row] });
    }
  } catch (error) {
    console.error(error);
  }
}

const registerHeardleJobs = async (client) => {
  // 8:55 pm PT
  const prevCron = new CronJob(`55 3 * * *`, async () => snapshotPrev(), null, true, 'utc');

  // 9:05 pm PT
  const nextCron = new CronJob(`5 4 * * *`, async () => snapshotNext(client), null, true, 'utc');

  return [prevCron, nextCron];
};

module.exports = {
  snapshotPrev,
  snapshotNext,
  registerHeardleJobs
};
