import { EmbedBuilder, SlashCommandBuilder, ChannelType } from 'discord.js';
import { Colors } from '../../../utils/constants.js';
import { checkPermissionsAndVoiceStatus } from '../util.js';

export const data = new SlashCommandBuilder()
  .setName('play')
  .setDescription('Play music using YouTube, Spotify, or SoundCloud')
  .addStringOption((option) => option.setName('song').setDescription('Search query or YouTube/Spotify/SoundCloud links').setRequired(true));

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });

  await checkPermissionsAndVoiceStatus(interaction);

  const chosenSong = interaction.options.getString('song');
  const voiceChannel = interaction.member.voice.channel;

  await interaction.client.DisTube.play(voiceChannel, chosenSong, {
    member: interaction.member
  });

  let description = '👍';
  if (voiceChannel.type === ChannelType.GuildStageVoice) {
    description += ' (promote me to Speaker pls)';
  }

  const confirmEmbed = new EmbedBuilder().setDescription(description).setColor(Colors.MUSIC);

  await interaction.editReply({ embeds: [confirmEmbed] });
}
