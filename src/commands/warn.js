import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { sendErrorEmbed } from '../utils/sendErrorEmbed.js';
import { createUser, getUser, updateUserWarning } from '../lib/mongo/services/User.js';

export const data = new SlashCommandBuilder()
  .setName('warn')
  .setDescription('Warn a user')
  .addUserOption((option) => option.setName('user').setDescription('The user to be warned').setRequired(true))
  .addStringOption((option) => option.setName('reason').setDescription('The reason for the warn').setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles);
export async function execute(interaction) {
  try {
    const userToWarn = interaction.options.getUser('user');
    const reasonForWarn = interaction.options.getString('reason');
    const modChannel = interaction.guild.channels.cache.get(process.env.MODERATORS_CHANNEL_ID);
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
      .setColor('ffd100')
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
      .setColor('ffd100')
      .setFooter({
        text: interaction.guild.name,
        iconURL: interaction.guild.iconURL({ dynamic: true })
      })
      .setTimestamp();

    try {
      await userToWarn.send({ embeds: [warnEmbed] });
    } catch (err) {
      return console.error(err);
    }

    const warnedEmbed = new EmbedBuilder().setDescription(`${userToWarn} was warned.`).setColor('ffd100');
    interaction.reply({ embeds: [warnedEmbed] });
  } catch (err) {
    sendErrorEmbed(interaction, err);
  }
}
