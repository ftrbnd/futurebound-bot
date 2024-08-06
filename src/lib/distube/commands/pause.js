import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { getAllowedRoleId } from '../../../utils/getAllowedRoleId.js';
import { sendErrorEmbed } from '../../../utils/sendErrorEmbed.js';

export const data = new SlashCommandBuilder().setName('pause').setDescription('Pause the currently playing song');
export async function execute(interaction) {
  try {
    const allowedRoleId = await getAllowedRoleId(interaction);
    if (!interaction.member._roles.includes(allowedRoleId) && allowedRoleId != interaction.guild.roles.everyone.id) {
      const errEmbed = new EmbedBuilder().setDescription(`You do not have permission to use music commands right now!`).setColor(process.env.ERROR_COLOR);
      return interaction.reply({ embeds: [errEmbed] });
    }

    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      const errEmbed = new EmbedBuilder().setDescription(`You must join a voice channel!`).setColor(process.env.ERROR_COLOR);
      return interaction.reply({ embeds: [errEmbed] });
    }

    const queue = interaction.client.DisTube.getQueue(interaction.guild);
    if (!queue) {
      const errEmbed = new EmbedBuilder().setDescription(`The queue is empty`).setColor(process.env.ERROR_COLOR);
      return interaction.reply({ embeds: [errEmbed] });
    }

    if (queue.paused) {
      queue.resume();
      const pauseEmbed = new EmbedBuilder().setDescription(`Resumed the song`).setColor(process.env.MUSIC_COLOR);
      return interaction.reply({ embeds: [pauseEmbed] });
    }

    queue.pause();
    const pauseEmbed = new EmbedBuilder().setDescription(`Paused the song`).setColor(process.env.MUSIC_COLOR);
    return interaction.reply({ embeds: [pauseEmbed] });
  } catch (err) {
    sendErrorEmbed(interaction, err);
  }
}
