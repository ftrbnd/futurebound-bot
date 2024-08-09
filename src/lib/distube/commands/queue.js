import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { replyToInteraction } from '../../../utils/error-handler.js';
import { Colors } from '../../../utils/constants.js';
import { checkPermissionsAndVoiceStatus, checkQueue } from '../util.js';

export const data = new SlashCommandBuilder().setName('queue').setDescription('View the current queue');
export async function execute(interaction) {
  try {
    await checkPermissionsAndVoiceStatus(interaction);
    const queue = await checkQueue(interaction);

    const queueList = queue.songs.map((song, id) => `${id + 1}) [${song.name}](${song.url}) - \`${song.formattedDuration}\``).join('\n');

    let repeatMode = '';
    switch (queue.repeatMode) {
      case 0:
        repeatMode = 'Off';
        break;
      case 1:
        repeatMode = 'Song';
        break;
      case 2:
        repeatMode = 'Queue';
        break;
    }

    const queueEmbed = new EmbedBuilder()
      .setDescription(queueList)
      .setColor(Colors.MUSIC)
      .setFooter({
        text: `Repeat mode: ${repeatMode}`
      });

    await interaction.reply({ embeds: [queueEmbed] });
  } catch (err) {
    await replyToInteraction(interaction, err);
  }
}
