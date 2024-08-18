import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { checkPermissionsAndVoiceStatus } from '../util.js';

export const data = new SlashCommandBuilder()
  .setName('playskip')
  .setDescription('Skip the current song and immediately play your song')
  .addStringOption((option) => option.setName('song').setDescription('Search query or YouTube link').setRequired(true));

export async function execute(interaction) {
  await checkPermissionsAndVoiceStatus(interaction);

  const chosenSong = interaction.options.getString('song');

  await interaction.client.DisTube.play(interaction.member.voice.channel, chosenSong, {
    member: interaction.member,
    textChannel: interaction.channel,
    skip: true
  });

  const playEmbed = new EmbedBuilder().setDescription(`Your entry: **${chosenSong}**`);

  await interaction.reply({ embeds: [playEmbed], ephemeral: true });
}
