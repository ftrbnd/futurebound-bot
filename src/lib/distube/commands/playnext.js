import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { sendErrorEmbed } from '../../../utils/sendErrorEmbed.js';
import { getMusicPermission } from '../../mongo/services/MusicPermission.js';
import { Colors } from '../../../utils/constants.js';

export const data = new SlashCommandBuilder()
  .setName('playnext')
  .setDescription('Add your song to the top of the queue')
  .addStringOption((option) => option.setName('song').setDescription('Search query or YouTube link').setRequired(true));
export async function execute(interaction) {
  try {
    const permission = await getMusicPermission();
    if (!interaction.member._roles.includes(permission.roleId) && permission.roleId != interaction.guild.roles.everyone.id) {
      const errEmbed = new EmbedBuilder().setDescription(`You do not have permission to use music commands right now!`).setColor(Colors.ERROR);
      return interaction.reply({ embeds: [errEmbed] });
    }

    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      const errEmbed = new EmbedBuilder().setDescription(`You must join a voice channel!`).setColor(Colors.ERROR);
      return interaction.reply({ embeds: [errEmbed] });
    }

    const chosenSong = interaction.options.getString('song');

    await interaction.client.DisTube.play(interaction.member.voice.channel, chosenSong, {
      member: interaction.member,
      textChannel: interaction.channel,
      position: 1
    }).catch((err) => {
      console.log(err);
      const errEmbed = new EmbedBuilder().setDescription(`An error occurred in /playskip.`).setColor(Colors.ERROR);
      return interaction.reply({ embeds: [errEmbed] });
    });

    const playEmbed = new EmbedBuilder().setDescription(`Your entry: **${chosenSong}**`);
    interaction.reply({ embeds: [playEmbed], ephemeral: true });
  } catch (err) {
    sendErrorEmbed(interaction, err);
  }
}
