import { EmbedBuilder } from 'discord.js';
import { env } from '../utils/env.js';
import { Colors } from '../utils/constants.js';

export const name = 'guildMemberAdd';
export async function execute(member) {
  const welcomeChannel = member.guild.channels.cache.get(env.WELCOME_CHANNEL_ID);
  if (!welcomeChannel) return;
  const rolesChannel = member.guild.channels.cache.get(env.ROLES_CHANNEL_ID);
  if (!rolesChannel) return;

  const welcomeEmbed = new EmbedBuilder()
    .setAuthor({
      name: member.displayName + ' just joined the server!',
      iconURL: member.user.displayAvatarURL({ dynamic: true })
    })
    .setColor(Colors.CONFIRM)
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setDescription(`Go to ${rolesChannel} to pick your favorite EP/album, and a color will be added to your name.`)
    .setFooter({
      text: member.guild.name,
      iconURL: member.guild.iconURL({ dynamic: true })
    })
    .setTimestamp();

  await welcomeChannel.send({ content: `${member}`, embeds: [welcomeEmbed] });
}
