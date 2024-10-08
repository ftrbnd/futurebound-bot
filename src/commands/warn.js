import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { sendMessageInLogChannel } from '../utils/error-handler.js';
import { createUser, getUser, updateUserWarning } from '../lib/mongo/services/User.js';
import { env } from '../utils/env.js';
import { Colors } from '../utils/constants.js';

export const data = new SlashCommandBuilder()
  .setName('warn')
  .setDescription('Warn a user')
  .addUserOption((option) => option.setName('user').setDescription('The user to be warned').setRequired(true))
  .addStringOption((option) => option.setName('reason').setDescription('The reason for the warn').setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles);

export async function execute(interaction) {
  const userToWarn = interaction.options.getUser('user');
  const reasonForWarn = interaction.options.getString('reason');
  const modChannel = interaction.guild.channels.cache.get(env.MODERATORS_CHANNEL_ID);
  if (!modChannel) return;

  const user = await getUser({ discordId: userToWarn.id });
  const warnCount = user ? user.warnings : 1;

  if (user) {
    await updateUserWarning(user, userToWarn.username, warnCount);
  } else {
    await createUser({
      discordId: userToWarn.id,
      username: userToWarn.username,
      warnings: 1
    });
  }

  const logEmbed = new EmbedBuilder()
    .setTitle(userToWarn.tag + ' was warned.')
    .addFields([
      { name: 'User ID: ', value: `${userToWarn.id}` },
      { name: 'By: ', value: `${interaction.user}` },
      { name: 'Reason: ', value: reasonForWarn },
      { name: 'Warnings: ', value: `${warnCount}` }
    ])
    .setColor(Colors.YELLOW)
    .setThumbnail(userToWarn.displayAvatarURL({ dynamic: true }))
    .setFooter({
      text: interaction.guild.name,
      iconURL: interaction.guild.iconURL({ dynamic: true })
    })
    .setTimestamp();
  await modChannel.send({ embeds: [logEmbed] });

  const warnEmbed = new EmbedBuilder()
    .setTitle(`You were warned in **${interaction.guild.name}**.`)
    .setDescription(reasonForWarn)
    .addFields([{ name: 'Warnings: ', value: `${warnCount}` }])
    .setColor(Colors.YELLOW)
    .setFooter({
      text: interaction.guild.name,
      iconURL: interaction.guild.iconURL({ dynamic: true })
    })
    .setTimestamp();

  try {
    await userToWarn.send({ embeds: [warnEmbed] });
  } catch (err) {
    await sendMessageInLogChannel(interaction, err);
  }

  const warnedEmbed = new EmbedBuilder().setDescription(`${userToWarn} was warned.`).setColor(Colors.YELLOW);

  await interaction.reply({ embeds: [warnedEmbed] });
}
