import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { sendErrorEmbed } from '../../../utils/sendErrorEmbed.js';
import { getMusicPermission } from '../../mongo/services/MusicPermission.js';

export const data = new SlashCommandBuilder().setName('leave').setDescription('Leave your voice channel');
export async function execute(interaction) {
  try {
    const permission = await getMusicPermission();
    if (!interaction.member._roles.includes(permission.roleId) && permission.roleId != interaction.guild.roles.everyone.id) {
      const errEmbed = new EmbedBuilder().setDescription(`You do not have permission to use music commands right now!`).setColor(process.env.ERROR_COLOR);
      return interaction.reply({ embeds: [errEmbed] });
    }

    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      const errEmbed = new EmbedBuilder().setDescription(`Not in a voice channel`).setColor(process.env.ERROR_COLOR);
      return interaction.reply({ embeds: [errEmbed] });
    }

    interaction.client.DisTube.voices.leave(voiceChannel);

    const leaveEmbed = new EmbedBuilder().setDescription(`Left **${interaction.member.voice.channel.name}**`).setColor(process.env.MUSIC_COLOR);
    interaction.reply({ embeds: [leaveEmbed] });
  } catch (err) {
    sendErrorEmbed(interaction, err);
  }
}
