import { EmbedBuilder, SlashCommandBuilder, ChannelType } from 'discord.js';
import { Colors } from '../../../utils/constants.js';
import { checkPermissionsAndVoiceStatus } from '../util.js';

export const data = new SlashCommandBuilder().setName('join').setDescription('Get the bot to join your voice channel');

export async function execute(interaction) {
  await checkPermissionsAndVoiceStatus(interaction);

  await interaction.client.DisTube.voices.join(voiceChannel);

  if (voiceChannel.type === ChannelType.GuildStageVoice) {
    await interaction.guild.members.me.voice.setSuppressed(false); // set bot as Stage speaker
  }

  const joinEmbed = new EmbedBuilder().setDescription(`Joined **${voiceChannel.name}**`).setColor(Colors.MUSIC);

  await interaction.reply({ embeds: [joinEmbed] });
}
