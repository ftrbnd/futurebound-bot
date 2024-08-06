const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const Playlist = require('../../../lib/mongo/schemas/Playlist');
const sendErrorEmbed = require('../../../utils/sendErrorEmbed');

module.exports = {
  data: new SlashCommandBuilder()
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
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // only the Server Moderator role can use this command

  async execute(interaction) {
    try {
      if (interaction.options.getSubcommand() === 'create') {
        const newPlaylistName = interaction.options.getString('name').toLowerCase();
        const newPlaylistLink = interaction.options.getString('link');

        const playlist = await Playlist.findOne({ name: newPlaylistName });

        if (!playlist) {
          await Playlist.create({
            name: newPlaylistName,
            link: newPlaylistLink
          });

          console.log(`Created a new playlist for ${newPlaylistName}`);
          const confirmEmbed = new EmbedBuilder().setDescription(`Created custom playlist for **${newPlaylistName}**`).setColor(process.env.MUSIC_COLOR);
          await interaction.reply({ embeds: [confirmEmbed] });
        } else {
          playlist.link = newPlaylistLink; // data.name is already the same as newPlaylistName
          playlist.save();

          const confirmEmbed = new EmbedBuilder().setDescription(`Updated playlist link for **${newPlaylistName}**`).setColor(process.env.MUSIC_COLOR);
          await interaction.reply({ embeds: [confirmEmbed] });
        }
      } else if (interaction.options.getSubcommand() === 'play') {
        if (interaction.isAutocomplete()) {
          const focusedValue = interaction.options.getFocused();
          const choices = [];
          await getPlaylists(choices);
          const filtered = choices.filter((choice) => choice[0].startsWith(focusedValue));
          await interaction.respond(filtered.map((choice) => ({ name: choice[0], value: choice[0] })));
        } else {
          const playlistName = await interaction.options.getString('name');

          const playlist = await Playlist.findOne({ name: playlistName });

          if (!playlist) {
            const dataEmbed = new EmbedBuilder().setDescription(`**${playlistName}** custom playlist does not exist`).setColor(process.env.ERROR_COLOR);
            return interaction.reply({ embeds: [dataEmbed] });
          } else {
            const voiceChannel = interaction.member.voice.channel;

            if (voiceChannel) {
              interaction.client.DisTube.play(voiceChannel, playlist.link, {
                member: interaction.member
              }).catch((err) => {
                console.log(err);
                const errEmbed = new EmbedBuilder().setDescription(`An error occurred in /customplaylist.`).setColor(process.env.ERROR_COLOR);
                return interaction.reply({ embeds: [errEmbed] });
              });

              if (voiceChannel.type === ChannelType.GuildStageVoice) {
                interaction.guild.members.me.voice.setSuppressed(false); // set bot as Stage speaker
              }

              const confirmEmbed = new EmbedBuilder().setDescription(`Now playing **${playlistName}** in ${voiceChannel}`).setColor(process.env.MUSIC_COLOR);
              await interaction.reply({ embeds: [confirmEmbed] });
            } else {
              const errEmbed = new EmbedBuilder().setDescription(`You must join a voice channel!`).setColor(process.env.ERROR_COLOR);
              return interaction.reply({ embeds: [errEmbed] });
            }
          }
        }
      }
    } catch (err) {
      sendErrorEmbed(interaction, err);
    }
  }
};

async function getPlaylists(choices) {
  const playlists = await Playlist.find({});
  if (playlists) {
    for (const playlist of playlists) {
      const playlistData = new Array(2);
      playlistData[0] = playlist.name;
      playlistData[1] = playlist.link;

      choices.push(playlistData);
    }
  }
}
