import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Colors } from '../../../utils/constants.js';
import { checkPermissionsAndVoiceStatus, checkQueue } from '../util.js';

export const data = new SlashCommandBuilder().setName('pause').setDescription('Pause the currently playing song');

export async function execute(interaction) {
  await checkPermissionsAndVoiceStatus(interaction);
  const queue = await checkQueue(interaction);

  if (queue.paused) {
    queue.resume();
    const pauseEmbed = new EmbedBuilder().setDescription(`Resumed the song`).setColor(Colors.MUSIC);
    return await interaction.reply({ embeds: [pauseEmbed] });
  }

  queue.pause();

  const pauseEmbed = new EmbedBuilder().setDescription(`Paused the song`).setColor(Colors.MUSIC);

  await interaction.reply({ embeds: [pauseEmbed] });
}
