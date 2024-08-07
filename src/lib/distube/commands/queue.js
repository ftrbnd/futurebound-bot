import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { sendErrorEmbed } from '../../../utils/sendErrorEmbed.js';
import { getMusicPermission } from '../../mongo/services/MusicPermission.js';
import { env } from '../../../utils/env.js';

export const data = new SlashCommandBuilder().setName('queue').setDescription('View the current queue');
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
      const errEmbed = new EmbedBuilder().setDescription(`The queue is empty`).setColor(env.ERROR_COLOR);
      return interaction.reply({ embeds: [errEmbed] });
    }

    const queueList = queue.songs.map((song, id) => `${id + 1}) [${song.name}](${song.url}) - \`${song.formattedDuration}\``).join('\n');

    let repeatMode = '';
    switch (queue.repeatMode) {
      case 0:
        repeatMode = 'Off';
        break;
      case 1:
        repeatMode = 'Song';
        break;
      case 2:
        repeatMode = 'Queue';
        break;
    }

    const queueEmbed = new EmbedBuilder()
      .setDescription(queueList)
      .setColor(env.MUSIC_COLOR)
      .setFooter({
        text: `Repeat mode: ${repeatMode}`
      });
    interaction.reply({ embeds: [queueEmbed] });
  } catch (err) {
    sendErrorEmbed(interaction, err);
  }
}
