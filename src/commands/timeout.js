import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { replyToInteraction, sendMessageInLogChannel } from '../utils/error-handler.js';
import { env } from '../utils/env.js';
import { Colors } from '../utils/constants.js';

export const data = new SlashCommandBuilder()
  .setName('timeout')
  .setDescription('Timeout a user for a specified amount of time')
  .addUserOption((option) => option.setName('user').setDescription('The user to be timed out').setRequired(true))
  .addIntegerOption((option) =>
    option
      .setName('duration')
      .setDescription('Timeout duration')
      .setRequired(true)
      .addChoices(
        { name: '1 minute', value: 60000 },
        { name: '5 minutes', value: 300000 },
        { name: '10 minutes', value: 600000 },
        { name: '1 hour', value: 3600000 },
        { name: '1 day', value: 86400000 },
        { name: '1 week', value: 604800000 }
      )
  )
  .addStringOption((option) => option.setName('reason').setDescription('The reason for timeout').setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles);
export async function execute(interaction) {
  try {
    const userToTimeout = interaction.guild.members.cache.get(interaction.options.getUser('user').id);
    const duration = interaction.options.getInteger('duration'); // milliseconds
    const reasonForTimeout = interaction.options.getString('reason');

    const modChannel = interaction.guild.channels.cache.get(env.MODERATORS_CHANNEL_ID);
    if (!modChannel) return;

    await userToTimeout.timeout(duration, reasonForTimeout);

    const millisecondsToDuration = new Map([
      [60000, '1 minute'],
      [300000, '5 minutes'],
      [600000, '10 minutes'],
      [3600000, '1 hour'],
      [86400000, '1 day'],
      [604800000, '1 week']
    ]);

    const logEmbed = new EmbedBuilder()
      .setTitle(userToTimeout.user.tag + ` was timed out for ${millisecondsToDuration.get(duration)}.`)
      .addFields([
        { name: 'User ID: ', value: `${userToTimeout.id}` },
        { name: 'By: ', value: `${interaction.user}` },
        { name: 'Reason: ', value: reasonForTimeout }
      ])
      .setColor(Colors.ERROR)
      .setThumbnail(userToTimeout.displayAvatarURL({ dynamic: true }))
      .setFooter({
        text: interaction.guild.name,
        iconURL: interaction.guild.iconURL({ dynamic: true })
      })
      .setTimestamp();
    await modChannel.send({ embeds: [logEmbed] });

    const timeoutEmbed = new EmbedBuilder()
      .setTitle(`You were timed out from **${interaction.guild.name}** for ${millisecondsToDuration.get(duration)}.`)
      .setDescription(reasonForTimeout)
      .setColor(Colors.ERROR)
      .setFooter({
        text: interaction.guild.name,
        iconURL: interaction.guild.iconURL({ dynamic: true })
      })
      .setTimestamp();

    try {
      await userToTimeout.send({ embeds: [timeoutEmbed] });
    } catch (err) {
      await sendMessageInLogChannel(interaction, err);
    }

    const timedOutEmbed = new EmbedBuilder().setDescription(`${userToTimeout} was timed out for ${millisecondsToDuration.get(duration)}.`).setColor(Colors.CONFIRM);

    await interaction.reply({ embeds: [timedOutEmbed] });
  } catch (err) {
    await replyToInteraction(interaction, err);
  }
}
