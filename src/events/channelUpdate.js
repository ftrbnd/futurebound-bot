import { EmbedBuilder, ChannelType } from 'discord.js';
import { env } from '../utils/env.js';

export const name = 'channelUpdate';
export async function execute(oldChannel, newChannel) {
  const logChannel = oldChannel.guild.channels.cache.get(env.LOGS_CHANNEL_ID);
  if (!logChannel) return;

  const channelType = oldChannel.type === ChannelType.GuildText ? 'text' : 'voice'; // if oldChannel type is GUILD_TEXT, then set channelType to text

  if (oldChannel.name != newChannel.name) {
    const changedEmbed = new EmbedBuilder()
      .setTitle(`A ${channelType} channel's name was changed.`)
      .addFields([
        { name: 'Previous name', value: oldChannel.name },
        { name: 'New name', value: newChannel.name }
      ])
      .setColor(env.CONFIRM_COLOR)
      .setFooter({
        text: `${oldChannel.guild.name}`,
        iconURL: oldChannel.guild.iconURL({ dynamic: true })
      })
      .setTimestamp();

    logChannel.send({ embeds: [changedEmbed] });
  }
}
