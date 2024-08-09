import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { replyToInteraction } from '../../../utils/error-handler.js';
import { Colors } from '../../../utils/constants.js';
import { checkPermissionsAndVoiceStatus, checkQueue } from '../util.js';

export const data = new SlashCommandBuilder().setName('shuffle').setDescription('Shuffle the queue');
export async function execute(interaction) {
  try {
    await checkPermissionsAndVoiceStatus(interaction);
    const queue = await checkQueue(interaction);

    queue.shuffle();

    const shuffleEmbed = new EmbedBuilder().setDescription('Shuffled the queue').setColor(Colors.MUSIC);

    await interaction.reply({ embeds: [shuffleEmbed] });
  } catch (err) {
    await replyToInteraction(interaction, err);
  }
}
