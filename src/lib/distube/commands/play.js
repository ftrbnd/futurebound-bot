import { EmbedBuilder, SlashCommandBuilder, ChannelType } from 'discord.js';
import { sendErrorEmbed } from '../../../utils/sendErrorEmbed.js';
import { getMusicPermission } from '../../mongo/services/MusicPermission.js';
import { Colors } from '../../../utils/constants.js';

export const data = new SlashCommandBuilder()
  .setName('play')
  .setDescription('Play music using YouTube, Spotify, or SoundCloud')
  .addStringOption((option) => option.setName('song').setDescription('Search query or YouTube/Spotify/SoundCloud links').setRequired(true));
export async function execute(interaction) {
  try {
    await interaction.deferReply({ ephemeral: true });

    async function checkPermissions() {
      try {
        const permission = await getMusicPermission();

        if (!interaction.member._roles.includes(permission.roleId) && permission.roleId != interaction.guild.roles.everyone.id) {
          const errEmbed = new EmbedBuilder().setDescription(`You do not have permission to use music commands right now!`).setColor(Colors.ERROR);
          return interaction.editReply({ embeds: [errEmbed] });
        }
      } catch (e) {
        return console.error(e);
      }
    }

    async function checkVoiceChannel() {
      try {
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
          const errEmbed = new EmbedBuilder().setDescription(`You must join a voice channel!`).setColor(Colors.ERROR);
          return interaction.editReply({ embeds: [errEmbed] });
        }
      } catch (e) {
        return console.error(e);
      }
    }

    async function unSuppress() {
      const voiceChannel = interaction.member.voice.channel;

      if (voiceChannel.type === ChannelType.GuildStageVoice) {
        try {
          await interaction.guild.members.me.voice.setSuppressed(false); // set bot as Stage speaker
        } catch (e) {
          return console.error(e);
        }
      }
    }

    async function playSong() {
      const chosenSong = interaction.options.getString('song');
      const voiceChannel = interaction.member.voice.channel;

      try {
        await interaction.client.DisTube.play(voiceChannel, chosenSong, {
          member: interaction.member
        });

        let description = '👍';
        if (voiceChannel.type === ChannelType.GuildStageVoice) {
          description += ' (promote me to Speaker pls)';
        }

        const confirmEmbed = new EmbedBuilder().setDescription(description).setColor(Colors.MUSIC);
        await interaction.editReply({ embeds: [confirmEmbed] });
      } catch (e) {
        console.error(e);
        const errEmbed = new EmbedBuilder().setDescription(`An error occurred in /play.`).setColor(Colors.ERROR);
        return interaction.editReply({ embeds: [errEmbed] });
      }
    }

    await checkPermissions();
    await checkVoiceChannel();
    // await unSuppress();
    await playSong();
  } catch (err) {
    sendErrorEmbed(interaction, err);
  }
}
