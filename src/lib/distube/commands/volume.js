import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { sendErrorEmbed } from '../../../utils/sendErrorEmbed.js';
import { getMusicPermission } from '../../mongo/services/MusicPermission.js';
import { env } from '../../../utils/env.js';

export const data = new SlashCommandBuilder()
  .setName('volume')
  .setDescription("Adjust the bot's volume for everyone")
  .addNumberOption((option) => option.setName('percent').setDescription('The volume percentage').setMinValue(0).setMaxValue(200).setRequired(true));
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

    const percent = interaction.options.getNumber('percent');
    interaction.client.DisTube.setVolume(interaction.guild, percent);

    const volumeEmbed = new EmbedBuilder().setDescription(`Adjusted volume to **${percent}%**`).setColor(env.MUSIC_COLOR);
    interaction.reply({ embeds: [volumeEmbed] });
  } catch (err) {
    sendErrorEmbed(interaction, err);
  }
}
