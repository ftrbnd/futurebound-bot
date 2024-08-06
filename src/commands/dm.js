import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { sendErrorEmbed } from '../utils/sendErrorEmbed.js';

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

    try {
      const dmChannel = await targetUser.createDM();
      await dmChannel.sendTyping();
      dmChannel.send(messageToSend);
    } catch (err) {
      return console.error(err);
    }

    const sentEmbed = new EmbedBuilder().setDescription(`Sent **"${messageToSend}"** to ${targetUser}`).setColor(process.env.CONFIRM_COLOR);

    return interaction.reply({ embeds: [sentEmbed] });
  } catch (err) {
    sendErrorEmbed(interaction, err);
  }
}
