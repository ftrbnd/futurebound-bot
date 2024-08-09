import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { replyToInteraction } from '../../../utils/error-handler.js';
import { Colors } from '../../../utils/constants.js';
import { checkPermissionsAndVoiceStatus, checkQueue } from '../util.js';

export const data = new SlashCommandBuilder().setName('previous').setDescription('Play the previous song in the queue');
export async function execute(interaction) {
  try {
    await checkPermissionsAndVoiceStatus(interaction);
    const queue = await checkQueue(interaction);

    const song = await queue.previous();

    const queueEmbed = new EmbedBuilder().setDescription(`Playing previous song **${song.name}**`).setColor(Colors.MUSIC);

    await interaction.reply({ embeds: [queueEmbed] });
  } catch (err) {
    await replyToInteraction(interaction, err);
  }
}
