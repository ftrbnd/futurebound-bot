import { EmbedBuilder } from 'discord.js';
import { env } from '../utils/env.js';
import { Colors } from '../utils/constants.js';
import { sendMessageInLogChannel } from '../utils/error-handler.js';

export const name = 'guildMemberUpdate';
export async function execute(oldMember, newMember) {
  const modChannel = newMember.guild.channels.cache.get(env.MODERATORS_CHANNEL_ID);
  if (!modChannel) return;
  const logChannel = newMember.guild.channels.cache.get(env.LOGS_CHANNEL_ID);
  if (!logChannel) return;

  try {
    if (oldMember.communicationDisabledUntil === null && newMember.communicationDisabledUntil !== null) {
      // a user is timed out
      const timeoutEmbed = new EmbedBuilder()
        .setTitle(`${newMember.user.username} was timed out.`)
        .addFields([
          { name: 'User: ', value: `${newMember.user}` },
          { name: 'ID: ', value: `${newMember.user.id}` }
        ])
        .setColor(Colors.ERROR)
        .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: newMember.guild.name,
          iconURL: newMember.guild.iconURL({ dynamic: true })
        })
        .setTimestamp();

      return await modChannel.send({ embeds: [timeoutEmbed] });
    } else if (oldMember.communicationDisabledUntil !== null && newMember.communicationDisabledUntil === null) {
      // a timeout is removed
      const timeoutEmbed = new EmbedBuilder()
        .setTitle(`${newMember.user.username}'s timeout was removed.`)
        .addFields([
          { name: 'User: ', value: `${newMember.user}` },
          { name: 'ID: ', value: `${newMember.user.id}` }
        ])
        .setColor(Colors.CONFIRM)
        .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: newMember.guild.name,
          iconURL: newMember.guild.iconURL({ dynamic: true })
        })
        .setTimestamp();

      return await modChannel.send({ embeds: [timeoutEmbed] });
    }

    // check if premium role was removed -> remove custom color role
    if (oldMember._roles.includes(env.SUBSCRIBER_ROLE_ID) && !newMember._roles.includes(env.SUBSCRIBER_ROLE_ID)) {
      const customColorRole = newMember.roles.cache.find((role) => role.name == 'Subscriber Custom Color');
      if (!customColorRole) return;

      newMember.roles.remove(customColorRole, 'No longer a premium member').then((member) => {
        if (customColorRole.members.size == 0) {
          customColorRole.delete('Role had 0 members left');
        }
      });

      const colorRemoveEmbed = new EmbedBuilder()
        .setTitle(`${newMember.user.tag} is no longer a Premium Member`)
        .setDescription(`Their custom color role was removed`)
        .setColor(customColorRole.hexColor)
        .setTimestamp();

      await logChannel.send({ embeds: [colorRemoveEmbed] });
    }
  } catch (error) {
    await sendMessageInLogChannel(null, error, logChannel);
  }
}
