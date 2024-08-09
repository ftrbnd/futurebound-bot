import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { replyToInteraction } from '../utils/error-handler.js';
import { Colors } from '../utils/constants.js';

export const data = new SlashCommandBuilder().setName('serverinfo').setDescription(`Get basic info about this server`);
export async function execute(interaction) {
  try {
    const owner = interaction.guild.members.cache.get(interaction.guild.ownerId);

    const serverInfo = new EmbedBuilder()
      .setTitle(`***${interaction.guild}*** Server Information`)
      .setDescription(interaction.guild.description)
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .setColor(Colors.INFO)
      .addFields([
        { name: 'Owner', value: `${owner}` },
        { name: 'Date Created', value: interaction.guild.createdAt.toDateString() },
        { name: 'Member Count', value: `${interaction.guild.memberCount}` },
        { name: 'Server Level', value: `${interaction.guild.premiumTier}` }, // remove 'TIER_' from 'TIER_#'
        { name: 'Server Boosts', value: `${interaction.guild.premiumSubscriptionCount}` }
      ]);

    await interaction.reply({ embeds: [serverInfo] });
  } catch (err) {
    await replyToInteraction(interaction, err);
  }
}
