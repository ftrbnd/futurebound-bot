import { EmbedBuilder } from 'discord.js';

export const name = 'playSong';
export async function execute(queue, song) {
  const playEmbed = new EmbedBuilder().setDescription(`Now playing [${song.name}](${song.url}) [${song.user}]`).setColor(process.env.MUSIC_COLOR);

  if (queue.textChannel) {
    queue.textChannel.send({ embeds: [playEmbed] });
  }
}
