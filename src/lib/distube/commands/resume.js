import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Colors } from '../../../utils/constants.js';
import { checkPermissionsAndVoiceStatus, checkQueue } from '../util.js';

export const data = new SlashCommandBuilder().setName('resume').setDescription('Resume playing the song');

export async function execute(interaction) {
  await checkPermissionsAndVoiceStatus(interaction);
  const queue = await checkQueue(interaction);

  if (!queue.paused) {
    throw new Error(`The queue is already playing`);
  }

  queue.resume();

  const pauseEmbed = new EmbedBuilder().setDescription(`Resumed the queue`).setColor(Colors.MUSIC);

  await interaction.reply({ embeds: [pauseEmbed] });
}
