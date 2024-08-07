import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { sendErrorEmbed } from '../../../utils/sendErrorEmbed.js';
import { getMusicPermission } from '../../mongo/services/MusicPermission.js';
import { env } from '../../../utils/env.js';

export const data = new SlashCommandBuilder().setName('skip').setDescription('Skip the current song in the queue');
export async function execute(interaction) {
  try {
    const permission = await getMusicPermission();
    if (!interaction.member._roles.includes(permission.roleId) && permission.roleId != interaction.guild.roles.everyone.id) {
      const errEmbed = new EmbedBuilder().setDescription(`You do not have permission to use music commands right now!`).setColor(env.ERROR_COLOR);
      return interaction.reply({ embeds: [errEmbed] });
    }

    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      const errEmbed = new EmbedBuilder().setDescription(`You must join a voice channel!`).setColor(env.ERROR_COLOR);
      return interaction.reply({ embeds: [errEmbed] });
    }

    const queue = interaction.client.DisTube.getQueue(interaction.guild);
    if (!queue) {
      const errEmbed = new EmbedBuilder().setDescription(`The queue is empty!`).setColor(env.ERROR_COLOR);
      return interaction.reply({ embeds: [errEmbed] });
    }

    if (queue.songs.length == 1) {
      queue.stop();

      const skipEndEmbed = new EmbedBuilder().setDescription(`Skipped **${queue.songs[0].name}** and the queue is now empty`).setColor(env.MUSIC_COLOR);
      return interaction.reply({ embeds: [skipEndEmbed] });
    }

    try {
      const song = await queue.skip();

      const queueEmbed = new EmbedBuilder().setDescription(`Skipped to **${song.name}**`).setColor(env.MUSIC_COLOR);
      interaction.reply({ embeds: [queueEmbed] });
    } catch (error) {
      console.error(error);
      const errEmbed = new EmbedBuilder().setDescription(`An error occurred in /skip.`).setColor(env.ERROR_COLOR);
      interaction.reply({ embeds: [errEmbed] });
    }
  } catch (err) {
    sendErrorEmbed(interaction, err);
  }
}
