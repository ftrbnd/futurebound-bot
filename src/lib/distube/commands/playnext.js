import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { replyToInteraction } from '../../../utils/error-handler.js';
import { checkPermissionsAndVoiceStatus } from '../util.js';

export const data = new SlashCommandBuilder()
  .setName('playnext')
  .setDescription('Add your song to the top of the queue')
  .addStringOption((option) => option.setName('song').setDescription('Search query or YouTube link').setRequired(true));
export async function execute(interaction) {
  try {
    await checkPermissionsAndVoiceStatus(interaction);

    const chosenSong = interaction.options.getString('song');

    await interaction.client.DisTube.play(interaction.member.voice.channel, chosenSong, {
      member: interaction.member,
      textChannel: interaction.channel,
      position: 1
    });

    const playEmbed = new EmbedBuilder().setDescription(`Your entry: **${chosenSong}**`);

    await interaction.reply({ embeds: [playEmbed], ephemeral: true });
  } catch (err) {
    await replyToInteraction(interaction, err);
  }
}
