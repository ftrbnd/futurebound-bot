import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { replyToInteraction } from '../utils/error-handler.js';
import { Colors } from '../utils/constants.js';

export const data = new SlashCommandBuilder()
  .setName('dm')
  .setDescription('DM a message to a user')
  .addUserOption((option) => option.setName('user').setDescription('The user to message').setRequired(true))
  .addStringOption((option) => option.setName('message').setDescription('What the bot should send').setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
export async function execute(interaction) {
  try {
    const targetUser = interaction.options.getUser('user');
    const messageToSend = interaction.options.getString('message');

    const dmChannel = await targetUser.createDM();
    await dmChannel.sendTyping();
    await dmChannel.send(messageToSend);

    const sentEmbed = new EmbedBuilder().setDescription(`Sent **"${messageToSend}"** to ${targetUser}`).setColor(Colors.CONFIRM);

    await interaction.reply({ embeds: [sentEmbed] });
  } catch (err) {
    await replyToInteraction(interaction, err);
  }
}
