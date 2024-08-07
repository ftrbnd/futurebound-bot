import { EmbedBuilder } from 'discord.js';
import { env } from '../../../utils/env.js';

export const name = 'addSong';
export async function execute(queue, song) {
  const playEmbed = new EmbedBuilder().setDescription(`Queued [${song.name}](${song.url}) [${song.user}]`).setColor(env.MUSIC_COLOR);

  if (queue.textChannel) {
    queue.textChannel.send({ embeds: [playEmbed] });
  }
}
