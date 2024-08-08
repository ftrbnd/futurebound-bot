import { EmbedBuilder } from 'discord.js';
import { Colors } from '../../../utils/constants.js';

export const name = 'addSong';
export async function execute(queue, song) {
  const playEmbed = new EmbedBuilder().setDescription(`Queued [${song.name}](${song.url}) [${song.user}]`).setColor(Colors.MUSIC);

  if (queue.textChannel) {
    queue.textChannel.send({ embeds: [playEmbed] });
  }
}
