import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { sendMessageInLogChannel } from '../utils/error-handler.js';
import { env } from '../utils/env.js';
import { Colors } from '../utils/constants.js';

export const data = new SlashCommandBuilder()
  .setName('kick')
  .setDescription('Kick a user from the server')
  .addUserOption((option) => option.setName('user').setDescription('The user to be kicked').setRequired(true))
  .addStringOption((option) => option.setName('reason').setDescription('The reason for the kick').setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  const userToKick = interaction.options.getUser('user');
  const reasonForKick = interaction.options.getString('reason');

  const modChannel = interaction.guild.channels.cache.get(env.MODERATORS_CHANNEL_ID);
  if (!modChannel) return;

  await interaction.guild.members.kick(userToKick, (options = { reason: reasonForKick }));

  const logEmbed = new EmbedBuilder()
    .setTitle(userToKick.tag + ' was kicked.')
    .addFields([
      { name: 'User ID: ', value: `${userToKick.id}` },
      { name: 'By: ', value: `${interaction.user}` },
      { name: 'Reason: ', value: reasonForKick }
    ])
    .setColor(Colors.ERROR)
    .setThumbnail(userToKick.displayAvatarURL({ dynamic: true }))
    .setFooter({
      text: interaction.guild.name,
      iconURL: interaction.guild.iconURL({ dynamic: true })
    })
    .setTimestamp();
  await modChannel.send({ embeds: [logEmbed] });

  const kickEmbed = new EmbedBuilder()
    .setTitle(`You were kicked from **${interaction.guild.name}**.`)
    .setDescription(reasonForKick)
    .setColor(Colors.ERROR)
    .setFooter({
      text: interaction.guild.name,
      iconURL: interaction.guild.iconURL({ dynamic: true })
    })
    .setTimestamp();

  try {
    await userToKick.send({ embeds: [kickEmbed] });
  } catch (err) {
    await sendMessageInLogChannel(interaction, err);
  }

  const kickedEmbed = new EmbedBuilder().setDescription(`${userToKick} was kicked.`).setColor(Colors.CONFIRM);

  await interaction.reply({ embeds: [kickedEmbed] });
}
