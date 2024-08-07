import { EmbedBuilder } from 'discord.js';
import { env } from '../../../utils/env.js';

export const name = 'error';
export async function execute(channel, error) {
  console.error(error);

  const errEmbed = new EmbedBuilder().setTitle(`${error.name}: An error occurred.`).setDescription(error.message).setColor(env.ERROR_COLOR);

  channel.send({ embeds: [errEmbed] });
}
