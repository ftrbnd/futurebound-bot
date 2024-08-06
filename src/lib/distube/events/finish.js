import { EmbedBuilder } from 'discord.js';

export const name = 'finish';
export async function execute(queue) {
  const finishEmbed = new EmbedBuilder().setDescription(`The queue has finished playing`).setColor(process.env.MUSIC_COLOR);

  if (queue.textChannel) {
    queue.textChannel.send({ embeds: [finishEmbed] });
  }
}
