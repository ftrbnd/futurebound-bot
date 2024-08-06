import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { sendErrorEmbed } from '../utils/sendErrorEmbed.js';
import { createUser, getUser, updateUserMute } from '../lib/mongo/services/User.js';

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

    const modChannel = interaction.guild.channels.cache.get(process.env.MODERATORS_CHANNEL_ID);
    if (!modChannel) return;

    const oneWeek = new Date();
    oneWeek.setDate(oneWeek.getDate() + 7);
    const user = await getUser({ discordId: userToMute.id });

    if (!user) {
      // if the user isn't already in the database, add their data
      await createUser({
        discordId: userToMute.id,
        username: userToMute.username,
        muteEnd: oneWeek
      });
    } else {
      // if they already were in the database, simply update and save
      await updateUserMute(user, oneWeek, userToMute.username);
    }

    try {
      userToMuteMember = interaction.guild.members.cache.get(`${userToMute.id}`);
      userToMuteMember.roles.set([process.env.MUTE_ROLE_ID]); // Mute role
    } catch (err) {
      return console.error(err);
    }

    const logEmbed = new EmbedBuilder()
      .setTitle(userToMute.tag + ' was muted for a week.')
      .addFields([
        { name: 'User ID: ', value: `${userToMute.id}` },
        { name: 'By: ', value: `${interaction.user}` },
        { name: 'Reason: ', value: reasonForMute },
        { name: 'Mute Ends: ', value: oneWeek.toDateString() }
      ])
      .setColor('000001')
      .setThumbnail(userToMute.displayAvatarURL({ dynamic: true }))
      .setFooter({
        text: interaction.guild.name,
        iconURL: interaction.guild.iconURL({ dynamic: true })
      })
      .setTimestamp();
    modChannel.send({ embeds: [logEmbed] });

    const muteEmbed = new EmbedBuilder()
      .setTitle(`You were muted in **${interaction.guild.name}** for a week.`)
      .addFields([
        { name: 'Reason: ', value: reasonForMute },
        { name: 'Mute Ends: ', value: oneWeek.toDateString() }
      ])
      .setColor('000001')
      .setFooter({
        text: interaction.guild.name,
        iconURL: interaction.guild.iconURL({ dynamic: true })
      })
      .setTimestamp();

    try {
      await userToMute.send({ embeds: [muteEmbed] });
    } catch (err) {
      return console.error(err);
    }

    const mutedEmbed = new EmbedBuilder().setDescription(`${userToMute} was muted.`).setColor(process.env.CONFIRM_COLOR);
    interaction.reply({ embeds: [mutedEmbed] });
  } catch (err) {
    sendErrorEmbed(interaction, err);
  }
}
