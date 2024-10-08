import { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { createPlaylist, getPlaylist, getPlaylistChoices, updatePlaylistLink } from '../../mongo/services/Playlist.js';
import { Colors } from '../../../utils/constants.js';

export const data = new SlashCommandBuilder()
  .setName('customplaylist')
  .setDescription('Create or play a custom playlist')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('create')
      .setDescription('Add a new playlist to the database')
      .addStringOption((option) => option.setName('name').setDescription('Playlist name').setRequired(true))
      .addStringOption((option) => option.setName('link').setDescription('YouTube playlist link').setRequired(true))
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('play')
      .setDescription('Play a pre-defined playlist')
      .addStringOption((option) => option.setName('name').setDescription('Playlist name').setRequired(true).setAutocomplete(true))
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  if (interaction.options.getSubcommand() === 'create') {
    const newPlaylistName = interaction.options.getString('name').toLowerCase();
    const newPlaylistLink = interaction.options.getString('link');

    const playlist = await getPlaylist({ name: newPlaylistName });

    if (playlist) {
      await updatePlaylistLink(playlist, newPlaylistLink);
    } else {
      await createPlaylist({
        name: newPlaylistName,
        link: newPlaylistLink
      });
    }

    const description = (playlist ? 'Updated playlist link' : 'Created custom playlist') + ` for **${newPlaylistName}**`;

    const confirmEmbed = new EmbedBuilder().setDescription(description).setColor(Colors.MUSIC);

    await interaction.reply({ embeds: [confirmEmbed] });
  } else if (interaction.options.getSubcommand() === 'play') {
    if (interaction.isAutocomplete()) {
      const focusedValue = interaction.options.getFocused();
      const choices = await getPlaylistChoices();

      const filtered = choices.filter((choice) => choice[0].startsWith(focusedValue));

      await interaction.respond(filtered.map((choice) => ({ name: choice[0], value: choice[0] })));
    } else {
      const playlistName = interaction.options.getString('name');

      const playlist = await getPlaylist({ name: playlistName });
      if (!playlist) {
        throw new Error(`**${playlistName}** custom playlist does not exist`);
      }

      const voiceChannel = interaction.member.voice.channel;
      if (!voiceChannel) {
        throw new Error(`You must join a voice channel!`);
      }

      await interaction.client.DisTube.play(voiceChannel, playlist.link, {
        member: interaction.member
      });

      if (voiceChannel.type === ChannelType.GuildStageVoice) {
        interaction.guild.members.me.voice.setSuppressed(false); // set bot as Stage speaker
      }

      const confirmEmbed = new EmbedBuilder().setDescription(`Now playing **${playlistName}** in ${voiceChannel}`).setColor(Colors.MUSIC);

      await interaction.reply({ embeds: [confirmEmbed] });
    }
  }
}
