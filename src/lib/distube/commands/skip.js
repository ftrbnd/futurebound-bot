import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { replyToInteraction } from '../../../utils/error-handler.js';
import { Colors } from '../../../utils/constants.js';
import { checkPermissionsAndVoiceStatus, checkQueue } from '../util.js';

export const data = new SlashCommandBuilder().setName('skip').setDescription('Skip the current song in the queue');
export async function execute(interaction) {
  try {
    await checkPermissionsAndVoiceStatus(interaction);
    const queue = await checkQueue(interaction);

    if (queue.songs.length == 1) {
      queue.stop();

      const skipEndEmbed = new EmbedBuilder().setDescription(`Skipped **${queue.songs[0].name}** and the queue is now empty`).setColor(Colors.MUSIC);
      return await interaction.reply({ embeds: [skipEndEmbed] });
    }

    const song = await queue.skip();

    const queueEmbed = new EmbedBuilder().setDescription(`Skipped to **${song.name}**`).setColor(Colors.MUSIC);

    await interaction.reply({ embeds: [queueEmbed] });
  } catch (err) {
    await replyToInteraction(interaction, err);
  }
}
