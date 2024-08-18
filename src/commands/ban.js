import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { sendMessageInLogChannel } from '../utils/error-handler.js';
import { env } from '../utils/env.js';
import { Colors } from '../utils/constants.js';

export const data = new SlashCommandBuilder()
  .setName('ban')
  .setDescription('Ban a user from the server')
  .addUserOption((option) => option.setName('user').setDescription('The user to be banned').setRequired(true))
  .addStringOption((option) => option.setName('reason').setDescription('The reason for the ban').setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  const userToBan = interaction.options.getUser('user');
  const reasonForBan = interaction.options.getString('reason');

  const modChannel = interaction.guild.channels.cache.get(env.MODERATORS_CHANNEL_ID);
  if (!modChannel) return;

  await interaction.guild.members.ban(userToBan, { reason: reasonForBan });

  const logEmbed = new EmbedBuilder()
    .setTitle(userToBan.tag + ' was banned.')
    .addFields([
      { name: 'User ID: ', value: `${userToBan.id}` },
      { name: 'By: ', value: `${interaction.user}` },
      { name: 'Reason: ', value: reasonForBan }
    ])
    .setColor(Colors.ERROR)
    .setThumbnail(userToBan.displayAvatarURL({ dynamic: true }))
    .setFooter({
      text: interaction.guild.name,
      iconURL: interaction.guild.iconURL({ dynamic: true })
    })
    .setTimestamp();
  await modChannel.send({ embeds: [logEmbed] });

  const banEmbed = new EmbedBuilder()
    .setTitle(`You were banned from **${interaction.guild.name}**.`)
    .setDescription(reasonForBan)
    .setColor(Colors.ERROR)
    .setFooter({
      text: interaction.guild.name,
      iconURL: interaction.guild.iconURL({ dynamic: true })
    })
    .setTimestamp();

  try {
    await userToBan.send({ embeds: [banEmbed] });
  } catch (err) {
    await sendMessageInLogChannel(interaction, err);
  }

  const bannedEmbed = new EmbedBuilder().setDescription(`${userToBan} was banned.`).setColor(Colors.CONFIRM);

  await interaction.reply({ embeds: [bannedEmbed] });
}
