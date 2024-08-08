import { EmbedBuilder } from 'discord.js';
import { Colors } from '../../../utils/constants.js';

export const name = 'error';
export async function execute(channel, error) {
  console.error(error);

  const errEmbed = new EmbedBuilder().setTitle(`${error.name}: An error occurred.`).setDescription(error.message).setColor(Colors.ERROR);

  channel.send({ embeds: [errEmbed] });
}
