import { EmbedBuilder } from 'discord.js';
import { Colors } from '../../../utils/constants.js';

export const name = 'empty';
export async function execute(queue) {
  const emptyEmbed = new EmbedBuilder().setDescription(`**${queue.voiceChannel.name}** is empty - disconnecting...`).setColor(Colors.MUSIC);

  if (queue.textChannel) {
    queue.textChannel.send({ embeds: [emptyEmbed] });
  }
}
