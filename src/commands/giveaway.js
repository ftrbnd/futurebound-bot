import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { createGiveaway, getGiveaway } from '../lib/mongo/services/Giveaway.js';
import { env } from '../utils/env.js';
import { Colors } from '../utils/constants.js';
import { endGiveaway } from '../lib/mongo/cron.js';

export const data = new SlashCommandBuilder()
  .setName('giveaway')
  .setDescription('Run a giveaway')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('start')
      .setDescription('Start a giveaway')
      .addChannelOption((option) => option.setName('channel').setDescription('The channel to post the giveaway in').setRequired(true))
      .addStringOption((option) => option.setName('prize').setDescription('The giveaway prize').setRequired(true))
      .addStringOption((option) => option.setName('description').setDescription('A short description').setRequired(true))
      .addStringOption((option) =>
        option.setName('unit').setDescription('unit of time').addChoices({ name: 'Minutes', value: 'minutes' }, { name: 'Hours', value: 'hours' }, { name: 'Days', value: 'days' }).setRequired(true)
      )
      .addIntegerOption((option) => option.setName('amount').setDescription('amount of specified time unit').setMinValue(1).setRequired(true))
      .addStringOption((option) => option.setName('image').setDescription('The image url').setRequired(false))
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('end')
      .setDescription('End a currently running giveaway')
      .addStringOption((option) => option.setName('id').setDescription('The giveaway id in the database').setRequired(true))
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  if (interaction.options.getSubcommand() === 'start') {
    const prize = interaction.options.getString('prize');
    const description = interaction.options.getString('description');
    const imageURL = interaction.options.getString('image');
    const giveawayChannel = interaction.options.getChannel('channel');

    const endDate = new Date();

    const unit = interaction.options.getString('unit');
    const amount = interaction.options.getInteger('amount');
    switch (unit) {
      case 'minutes':
        endDate.setMinutes(endDate.getMinutes() + amount);
        break;
      case 'hours':
        endDate.setHours(endDate.getHours() + amount);
        break;
      case 'days':
        endDate.setDate(endDate.getDate() + amount);
        break;
    }
    const timestamp = `${endDate.getTime()}`.substring(0, 10);

    const giveaway = await createGiveaway({
      prize,
      description,
      endDate,
      imageURL,
      channelId: giveawayChannel.id
    });

    console.log(`Saved ${prize} giveaway to database!`);

    const giveawayEmbed = new EmbedBuilder()
      .setTitle(`Giveaway: ${prize}`)
      .setDescription(description)
      .addFields([{ name: 'End Date', value: `<t:${timestamp}>` }])
      .setColor(Colors.GIVEAWAY);
    if (imageURL) giveawayEmbed.setThumbnail(imageURL);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`giveaway_${giveaway.id}`).setStyle(ButtonStyle.Primary).setEmoji(env.GIVEAWAY_EMOJI_ID),
      new ButtonBuilder().setLabel('Subscribe').setStyle(ButtonStyle.Link).setURL(`https://discord.com/channels/${interaction.guild.id}/role-subscriptions`)
    );

    await giveawayChannel.send({ embeds: [giveawayEmbed], components: [row] });

    const confirmEmbed = new EmbedBuilder()
      .setDescription(`Started giveaway for **${prize}** in ${giveawayChannel}, ends in ${amount} ${amount == 1 ? unit.substring(0, unit.length - 1) : unit}`)
      .addFields([{ name: 'End Date', value: `<t:${timestamp}>` }])
      .setColor(Colors.CONFIRM);

    await interaction.reply({ embeds: [confirmEmbed] });
  } else if (interaction.options.getSubcommand() === 'end') {
    const giveawayId = interaction.options.getString('id');
    const giveaway = await getGiveaway(giveawayId);

    await endGiveaway(interaction.client, giveaway);

    const confirmEmbed = new EmbedBuilder().setDescription(`Ended giveaway for **${giveaway.prize}**`).setColor(Colors.CONFIRM);

    await interaction.reply({ embeds: [confirmEmbed] });
  }
}
