import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, ChannelType } from 'discord.js';
import { replyToInteraction } from '../utils/error-handler.js';
import { Colors } from '../utils/constants.js';

export const data = new SlashCommandBuilder()
  .setName('react')
  .setDescription('React to the newest message in a channel')
  .addChannelOption((option) => option.setName('channel').setDescription('The name of the channel').addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement).setRequired(true))
  .addStringOption((option) => option.setName('emoji').setDescription('The emoji to react with').setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
export async function execute(interaction) {
  try {
    const channel = interaction.options.getChannel('channel');
    const emoji = interaction.options.getString('emoji');

    await channel.lastMessage.react(emoji);

    const confirmEmbed = new EmbedBuilder().setDescription(`Reacted to ${channel.lastMessage} with ${emoji}`).setColor(Colors.CONFIRM);

    await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });
  } catch (err) {
    await replyToInteraction(interaction, err);
  }
}
