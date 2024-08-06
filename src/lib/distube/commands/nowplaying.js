import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { getAllowedRoleId } from '../../../utils/getAllowedRoleId.js';
import { sendErrorEmbed } from '../../../utils/sendErrorEmbed.js';

export const data = new SlashCommandBuilder().setName('nowplaying').setDescription('See what song is currently playing');
export async function execute(interaction) {
  try {
    const allowedRoleId = await getAllowedRoleId(interaction);
    if (!interaction.member._roles.includes(allowedRoleId) && allowedRoleId != interaction.guild.roles.everyone.id) {
      const errEmbed = new EmbedBuilder().setDescription(`You do not have permission to use music commands right now!`).setColor(process.env.ERROR_COLOR);
      return interaction.reply({ embeds: [errEmbed] });
    }

    const voiceChannel = interaction.client.DisTube.voices.get(interaction.member.voice.channel);
    if (!voiceChannel) {
      const errEmbed = new EmbedBuilder().setDescription(`Not in a voice channel`).setColor(process.env.ERROR_COLOR);
      return interaction.reply({ embeds: [errEmbed] });
    }

    const queue = interaction.client.DisTube.getQueue(interaction.guild);
    if (!queue) {
      const errEmbed = new EmbedBuilder().setDescription(`There is nothing playing`).setColor(process.env.ERROR_COLOR);
      return interaction.reply({ embeds: [errEmbed] });
    }

    const npEmbed = new EmbedBuilder().setDescription(`Now playing [${queue.songs[0].name}](${queue.songs[0].url}) [${queue.songs[0].user}]`).setColor(process.env.MUSIC_COLOR);
    interaction.reply({ embeds: [npEmbed] });
  } catch (err) {
    sendErrorEmbed(interaction, err);
  }
}
