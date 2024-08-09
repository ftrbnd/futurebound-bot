import { EmbedBuilder } from 'discord.js';
import { Colors } from '../../../utils/constants.js';

export const name = 'finish';
export async function execute(queue) {
  const finishEmbed = new EmbedBuilder().setDescription(`The queue has finished playing`).setColor(Colors.MUSIC);

  if (queue.textChannel) {
    await queue.textChannel.send({ embeds: [finishEmbed] });
  }
}
