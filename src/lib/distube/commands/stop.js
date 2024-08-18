import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Colors } from '../../../utils/constants.js';
import { checkPermissionsAndVoiceStatus, checkQueue } from '../util.js';

export const data = new SlashCommandBuilder().setName('stop').setDescription('Stop the music and delete the queue');
export async function execute(interaction) {
  await checkPermissionsAndVoiceStatus(interaction);
  const queue = await checkQueue(interaction);

  queue.stop();

  const stopEmbed = new EmbedBuilder().setDescription('Stopped the queue').setColor(Colors.MUSIC);

  await interaction.reply({ embeds: [stopEmbed] });
}
