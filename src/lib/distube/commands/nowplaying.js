import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { sendErrorEmbed } from '../../../utils/sendErrorEmbed.js';
import { getMusicPermission } from '../../mongo/services/MusicPermission.js';
import { Colors } from '../../../utils/constants.js';

export const data = new SlashCommandBuilder().setName('nowplaying').setDescription('See what song is currently playing');
export async function execute(interaction) {
  try {
    const permission = await getMusicPermission();
    if (!interaction.member._roles.includes(permission.roleId) && permission.roleId != interaction.guild.roles.everyone.id) {
      const errEmbed = new EmbedBuilder().setDescription(`You do not have permission to use music commands right now!`).setColor(Colors.ERROR);
      return interaction.reply({ embeds: [errEmbed] });
    }

    const voiceChannel = interaction.client.DisTube.voices.get(interaction.member.voice.channel);
    if (!voiceChannel) {
      const errEmbed = new EmbedBuilder().setDescription(`Not in a voice channel`).setColor(Colors.ERROR);
      return interaction.reply({ embeds: [errEmbed] });
    }

    const queue = interaction.client.DisTube.getQueue(interaction.guild);
    if (!queue) {
      const errEmbed = new EmbedBuilder().setDescription(`There is nothing playing`).setColor(Colors.ERROR);
      return interaction.reply({ embeds: [errEmbed] });
    }

    const npEmbed = new EmbedBuilder().setDescription(`Now playing [${queue.songs[0].name}](${queue.songs[0].url}) [${queue.songs[0].user}]`).setColor(Colors.MUSIC);
    interaction.reply({ embeds: [npEmbed] });
  } catch (err) {
    sendErrorEmbed(interaction, err);
  }
}
