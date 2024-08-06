import { EmbedBuilder, SlashCommandBuilder, ChannelType } from 'discord.js';
import { getAllowedRoleId } from '../../../utils/getAllowedRoleId.js';
import { sendErrorEmbed } from '../../../utils/sendErrorEmbed.js';

export const data = new SlashCommandBuilder().setName('join').setDescription('Get the bot to join your voice channel');
export async function execute(interaction) {
  try {
    const allowedRoleId = await getAllowedRoleId();
    if (!interaction.member._roles.includes(allowedRoleId) && allowedRoleId != interaction.guild.roles.everyone.id) {
      const errEmbed = new EmbedBuilder().setDescription(`You do not have permission to use music commands right now!`).setColor(process.env.ERROR_COLOR);
      return interaction.reply({ embeds: [errEmbed] });
    }

    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      const errEmbed = new EmbedBuilder().setDescription(`You must join a voice channel!`).setColor(process.env.ERROR_COLOR);
      return interaction.reply({ embeds: [errEmbed] });
    }

    await interaction.client.DisTube.voices.join(voiceChannel);

    if (voiceChannel.type === ChannelType.GuildStageVoice) {
      await interaction.guild.members.me.voice.setSuppressed(false); // set bot as Stage speaker
    }

    const joinEmbed = new EmbedBuilder().setDescription(`Joined **${voiceChannel.name}**`).setColor(process.env.MUSIC_COLOR);
    interaction.reply({ embeds: [joinEmbed] });
  } catch (err) {
    sendErrorEmbed(interaction, err);
  }
}
