import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { replyToInteraction } from '../../../utils/error-handler.js';
import { Colors } from '../../../utils/constants.js';
import { checkPermissionsAndVoiceStatus, checkQueue } from '../util.js';

export const data = new SlashCommandBuilder().setName('nowplaying').setDescription('See what song is currently playing');
export async function execute(interaction) {
  try {
    await checkPermissionsAndVoiceStatus(interaction);
    const queue = await checkQueue(interaction);

    const npEmbed = new EmbedBuilder().setDescription(`Now playing [${queue.songs[0].name}](${queue.songs[0].url}) [${queue.songs[0].user}]`).setColor(Colors.MUSIC);

    await interaction.reply({ embeds: [npEmbed] });
  } catch (err) {
    await replyToInteraction(interaction, err);
  }
}
