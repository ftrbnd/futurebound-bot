import { EmbedBuilder, SlashCommandBuilder, ChannelType } from 'discord.js';
import { sendErrorEmbed } from '../../../utils/sendErrorEmbed.js';
import { getMusicPermission } from '../../mongo/services/MusicPermission.js';
import { env } from '../../../utils/env.js';

export const data = new SlashCommandBuilder().setName('join').setDescription('Get the bot to join your voice channel');
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

    await interaction.client.DisTube.voices.join(voiceChannel);

    if (voiceChannel.type === ChannelType.GuildStageVoice) {
      await interaction.guild.members.me.voice.setSuppressed(false); // set bot as Stage speaker
    }

    const joinEmbed = new EmbedBuilder().setDescription(`Joined **${voiceChannel.name}**`).setColor(env.MUSIC_COLOR);
    interaction.reply({ embeds: [joinEmbed] });
  } catch (err) {
    sendErrorEmbed(interaction, err);
  }
}
