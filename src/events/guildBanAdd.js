import { EmbedBuilder } from 'discord.js';
import { env } from '../utils/env.js';
import { Colors } from '../utils/constants.js';
import { sendMessageInLogChannel } from '../utils/error-handler.js';

export const name = 'guildBanAdd';
export async function execute(ban) {
  const modChannel = ban.guild.channels.cache.get(env.MODERATORS_CHANNEL_ID);
  if (!modChannel) return;

  try {
    const logEmbed = new EmbedBuilder()
      .setTitle(`${ban.user.username} was banned.`)
      .addFields([
        { name: 'User: ', value: `${ban.user}` },
        { name: 'ID: ', value: `${ban.user.id}` }
      ])
      .setColor(Colors.ERROR)
      .setThumbnail(ban.user.displayAvatarURL({ dynamic: true }))
      .setFooter({
        text: ban.guild.name,
        iconURL: ban.guild.iconURL({ dynamic: true })
      })
      .setTimestamp();

    await modChannel.send({ embeds: [logEmbed] });
  } catch (error) {
    sendMessageInLogChannel(null, error, modChannel);
  }
}
