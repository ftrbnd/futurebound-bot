import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { sendErrorEmbed } from '../utils/sendErrorEmbed.js';
import { Colors } from '../utils/constants.js';

export const data = new SlashCommandBuilder()
  .setName('clear')
  .setDescription('Delete a certain amount of messages')
  .addIntegerOption((option) => option.setName('amount').setDescription('The amount of messages to delete (1-100)').setMinValue(1).setMaxValue(100).setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
export async function execute(interaction) {
  try {
    const amountToDelete = interaction.options.getInteger('amount');

    interaction.channel.bulkDelete(amountToDelete, true);

    const singularOrPlural = amountToDelete == 1 ? 'message' : 'messages';
    const amountDescription = `Successfully deleted ${amountToDelete} ${singularOrPlural}!`;

    const clearEmbed = new EmbedBuilder().setDescription(amountDescription).setColor(Colors.CONFIRM);
    interaction.reply({ embeds: [clearEmbed], ephemeral: true });
  } catch (err) {
    sendErrorEmbed(interaction, err);
  }
}
