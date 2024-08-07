import { EmbedBuilder } from 'discord.js';
import { env } from '../../../utils/env.js';

export const name = 'finish';
export async function execute(queue) {
  const finishEmbed = new EmbedBuilder().setDescription(`The queue has finished playing`).setColor(env.MUSIC_COLOR);

  if (queue.textChannel) {
    queue.textChannel.send({ embeds: [finishEmbed] });
  }
}
