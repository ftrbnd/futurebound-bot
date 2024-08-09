import { EmbedBuilder, ChannelType } from 'discord.js';
import { env } from '../utils/env.js';
import { Colors } from '../utils/constants.js';

export const name = 'channelUpdate';
export async function execute(oldChannel, newChannel) {
  const logChannel = oldChannel.guild.channels.cache.get(env.LOGS_CHANNEL_ID);
  if (!logChannel) return;

  try {
    const channelType = oldChannel.type === ChannelType.GuildText ? 'text' : 'voice'; // if oldChannel type is GUILD_TEXT, then set channelType to text

    if (oldChannel.name != newChannel.name) {
      const changedEmbed = new EmbedBuilder()
        .setTitle(`A ${channelType} channel's name was changed.`)
        .addFields([
          { name: 'Previous name', value: oldChannel.name },
          { name: 'New name', value: newChannel.name }
        ])
        .setColor(Colors.CONFIRM)
        .setFooter({
          text: `${oldChannel.guild.name}`,
          iconURL: oldChannel.guild.iconURL({ dynamic: true })
        })
        .setTimestamp();

      await logChannel.send({ embeds: [changedEmbed] });
    }
  } catch (error) {
    await sendMessageInLogChannel(null, error, logChannel);
  }
}
