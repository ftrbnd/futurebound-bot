const { EmbedBuilder, ThreadAutoArchiveDuration } = require('discord.js');
const supabase = require('./supabase');
const { CronJob } = require('cron');

const heardle = async (client) => {
  const job = new CronJob(`${process.env.CRON_MINUTE} ${process.env.CRON_HOUR} * * * `, () => announce(client), null, true, 'utc');
};

const announce = async (client) => {
  const server = client.guilds.cache.get(process.env.GUILD_ID);
  const heardleChannel = server.channels.cache.get(process.env.HEARDLE_CHANNEL_ID);

  try {
    // get yesterday's Heardle song
    const { data, error } = await supabase.from('DailySong').select().eq('id', 0);
    if (error) return console.log(error);

    // close and lock previous thread
    const lastThread = heardleChannel.threads.cache.last();
    if (lastThread && !lastThread.locked) {
      await lastThread.setLocked(true);
    }

    const heardleEmbed = new EmbedBuilder()
      .setTitle(`EDEN Heardle #${data[0].heardleDay + 1} - New daily song!`)
      .setURL('https://eden-heardle.io')
      .setDescription(`Yesterday's song was **${data[0].name}**`)
      .setThumbnail('https://i.imgur.com/rQmm1FM.png')
      .setColor(0xf9d72f)
      .setFooter({
        text: 'Share your results in the thread!',
        iconURL: server.iconURL({ dynamic: true })
      });

    const message = await heardleChannel.send({ embeds: [heardleEmbed] });

    await message.startThread({
      name: `EDEN Heardle #${data[0].heardleDay + 1}`,
      autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
      reason: 'New daily heardle song'
    });
  } catch (err) {
    console.log('Error with announcing daily Heardle: ', err);
  }
};

module.exports = heardle;
