import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { replyToInteraction, sendMessageInLogChannel } from '../utils/error-handler.js';
import { createUser, getUser, updateUserMute } from '../lib/mongo/services/User.js';
import { env } from '../utils/env.js';
import { Colors } from '../utils/constants.js';

export const data = new SlashCommandBuilder()
  .setName('mute')
  .setDescription('Mute a user by giving them the Muted role')
  .addUserOption((option) => option.setName('user').setDescription('The user to be muted').setRequired(true))
  .addStringOption((option) => option.setName('reason').setDescription('The reason for the mute').setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles);
export async function execute(interaction) {
  try {
    const userToMute = interaction.options.getUser('user');
    const reasonForMute = interaction.options.getString('reason');

    const modChannel = interaction.guild.channels.cache.get(env.MODERATORS_CHANNEL_ID);
    if (!modChannel) return;

    const oneWeek = new Date();
    oneWeek.setDate(oneWeek.getDate() + 7);
    const user = await getUser({ discordId: userToMute.id });

    if (!user) {
      await createUser({
        discordId: userToMute.id,
        username: userToMute.username,
        muteEnd: oneWeek
      });
    } else {
      await updateUserMute(user, oneWeek, userToMute.username);
    }

    const userToMuteMember = interaction.guild.members.cache.get(`${userToMute.id}`);
    userToMuteMember.roles.set([env.MUTED_ROLE_ID]); // Mute role

    const logEmbed = new EmbedBuilder()
      .setTitle(userToMute.tag + ' was muted for a week.')
      .addFields([
        { name: 'User ID: ', value: `${userToMute.id}` },
        { name: 'By: ', value: `${interaction.user}` },
        { name: 'Reason: ', value: reasonForMute },
        { name: 'Mute Ends: ', value: oneWeek.toDateString() }
      ])
      .setColor(Colors.BLACK)
      .setThumbnail(userToMute.displayAvatarURL({ dynamic: true }))
      .setFooter({
        text: interaction.guild.name,
        iconURL: interaction.guild.iconURL({ dynamic: true })
      })
      .setTimestamp();

    await modChannel.send({ embeds: [logEmbed] });

    const muteEmbed = new EmbedBuilder()
      .setTitle(`You were muted in **${interaction.guild.name}** for a week.`)
      .addFields([
        { name: 'Reason: ', value: reasonForMute },
        { name: 'Mute Ends: ', value: oneWeek.toDateString() }
      ])
      .setColor(Colors.BLACK)
      .setFooter({
        text: interaction.guild.name,
        iconURL: interaction.guild.iconURL({ dynamic: true })
      })
      .setTimestamp();

    try {
      await userToMute.send({ embeds: [muteEmbed] });
    } catch (err) {
      await sendMessageInLogChannel(interaction, err);
    }

    const mutedEmbed = new EmbedBuilder().setDescription(`${userToMute} was muted.`).setColor(Colors.CONFIRM);

    await interaction.reply({ embeds: [mutedEmbed] });
  } catch (err) {
    replyToInteraction(interaction, err);
  }
}
