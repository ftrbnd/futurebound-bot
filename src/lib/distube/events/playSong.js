import { EmbedBuilder } from 'discord.js';
import { Colors } from '../../../utils/constants.js';

export const name = 'playSong';
export async function execute(queue, song) {
  const playEmbed = new EmbedBuilder().setDescription(`Now playing [${song.name}](${song.url}) [${song.user}]`).setColor(Colors.MUSIC);

  if (queue.textChannel) {
    queue.textChannel.send({ embeds: [playEmbed] });
  }
}
