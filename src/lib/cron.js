const DailyHeardleCheck = require('../schemas/DailyHeardleCheckSchema');
const { CronJob } = require('cron');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getCurrentDailySong } = require('./heardle-api');

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

const registerPrevHeardleCheck = async () => {
  // 8:55 pm PT
  const cron = new CronJob(`55 3 * * *`, async () => snapshotPrev(), null, true, 'utc');

  return cron;
};

const registerNextHeardleCheck = async (client) => {
  // 9:05 pm PT
  const cron = new CronJob(`5 4 * * *`, async () => snapshotNext(client), null, true, 'utc');

  return cron;
};

module.exports = {
  snapshotPrev,
  snapshotNext,
  registerPrevHeardleCheck,
  registerNextHeardleCheck
};
