import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Colors } from '../../../utils/constants.js';
import { checkPermissionsAndVoiceStatus } from '../util.js';

export const data = new SlashCommandBuilder().setName('leave').setDescription('Leave your voice channel');

export async function execute(interaction) {
  await checkPermissionsAndVoiceStatus(interaction);

  interaction.client.DisTube.voices.leave(voiceChannel);

  const leaveEmbed = new EmbedBuilder().setDescription(`Left **${interaction.member.voice.channel.name}**`).setColor(Colors.MUSIC);

  await interaction.reply({ embeds: [leaveEmbed] });
}
