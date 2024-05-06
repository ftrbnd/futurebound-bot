const supabase = require('../lib/supabase');
const DailyHeardleCheck = require('../schemas/DailyHeardleCheckSchema');
const { CronJob } = require('cron');
const { EmbedBuilder } = require('discord.js');

async function getCurrentDailySong() {
  const { data, error } = await supabase.from('DailySong').select().eq('id', '1');
  if (error) throw new Error('Failed to get DailySong');

  return data[0];
}

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

    if (status.prevDay === status.nextDay) {
      const server = await client.guilds.cache.get(process.env.GUILD_ID);
      const owner = await server.fetchOwner();

      const embed = new EmbedBuilder().addFields([
        { name: 'Previous Day', value: `${status.prevDay}` },
        { name: 'Previous Song', value: `${status.prevSong}` },
        { name: 'Next Day', value: `${status.nextDay}` },
        { name: 'Next Song', value: `${status.nextSong}` }
      ]);

      await owner.send({ content: 'Daily Heardle failed to run', embeds: [embed] });
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
