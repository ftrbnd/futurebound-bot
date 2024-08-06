import { EmbedBuilder } from 'discord.js';

export const name = 'guildBanAdd';
export async function execute(ban) {
  const modChannel = ban.guild.channels.cache.get(process.env.MODERATORS_CHANNEL_ID);
  if (!modChannel) return;

  const logEmbed = new EmbedBuilder()
    .setTitle(`${ban.user.username} was banned.`)
    .addFields([
      { name: 'User: ', value: `${ban.user}` },
      { name: 'ID: ', value: `${ban.user.id}` }
    ])
    .setColor(process.env.ERROR_COLOR)
    .setThumbnail(ban.user.displayAvatarURL({ dynamic: true }))
    .setFooter({
      text: ban.guild.name,
      iconURL: ban.guild.iconURL({ dynamic: true })
    })
    .setTimestamp();

  modChannel.send({ embeds: [logEmbed] });
}
