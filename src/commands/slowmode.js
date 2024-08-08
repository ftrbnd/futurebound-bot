import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { sendErrorEmbed } from '../utils/sendErrorEmbed.js';
import { Colors } from '../utils/constants.js';

export const data = new SlashCommandBuilder()
  .setName('slowmode')
  .setDescription('Enable slowmode in a channel')
  .addChannelOption((option) => option.setName('channel').setDescription('The channel to enable slowmode in').setRequired(true))
  .addIntegerOption((option) => option.setName('seconds').setDescription('The interval of seconds').setMinValue(0).setMaxValue(3600).setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
export async function execute(interaction) {
  try {
    const targetChannel = interaction.options.getChannel('channel');
    const seconds = interaction.options.getInteger('seconds');

    targetChannel.setRateLimitPerUser(seconds);

    const embed = new EmbedBuilder().setDescription(`Enabled slowmode in ${targetChannel} for ${seconds} seconds`).setColor(Colors.CONFIRM);

    await interaction.reply({ embeds: [embed], ephemeral: true });
  } catch (err) {
    sendErrorEmbed(interaction, err);
  }
}
