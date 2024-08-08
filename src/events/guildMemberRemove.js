import { EmbedBuilder } from 'discord.js';
import { env } from '../utils/env.js';
import { Colors } from '../utils/constants.js';

export const name = 'guildMemberRemove';
export async function execute(member) {
  const logChannel = member.guild.channels.cache.get(env.LOGS_CHANNEL_ID);
  if (!logChannel) return;

  const leaveEmbed = new EmbedBuilder()
    .setAuthor({
      name: member.displayName + ' has left the server.',
      iconURL: member.user.displayAvatarURL({ dynamic: true })
    })
    .addFields([{ name: 'User ID: ', value: `${member.user.id}` }])
    .setColor(Colors.ERROR)
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setFooter({
      text: member.guild.name,
      iconURL: member.guild.iconURL({ dynamic: true })
    })
    .setTimestamp();

  await logChannel.send({ embeds: [leaveEmbed] });
}
