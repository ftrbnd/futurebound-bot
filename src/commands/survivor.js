const path = require('path');
const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const Album = require('../lib/mongo/schemas/AlbumSchema');
const sendErrorEmbed = require('../utils/sendErrorEmbed');
const lineSplitFile = require('../utils/lineSplitFile');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('survivor')
    .setDescription('Start a new round of Survivor!')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('round')
        .setDescription('Start a new round of survivor')
        .addStringOption((option) =>
          option
            .setName('album')
            .setDescription('The name of the album/ep')
            .setRequired(true)
            .addChoices(
              { name: 'End Credits', value: 'End Credits' },
              { name: 'i think you think too much of me', value: 'i think you think too much of me' },
              { name: 'vertigo', value: 'vertigo' },
              { name: 'no future', value: 'no future' },
              { name: 'ICYMI', value: 'ICYMI' },
              { name: 'Champions', value: 'Champions' }
            )
        )
        .addStringOption((option) => option.setName('loser').setDescription('The song that had the most reactions in the last round').setRequired(false))
    ) // if it's the first round, there is no loser
    .addSubcommand((subcommand) =>
      subcommand
        .setName('winner')
        .setDescription('Announce the song that won!')
        .addStringOption((option) =>
          option
            .setName('album')
            .setDescription('The name of the album/ep')
            .setRequired(true)
            .addChoices(
              { name: 'End Credits', value: 'End Credits' },
              { name: 'i think you think too much of me', value: 'i think you think too much of me' },
              { name: 'vertigo', value: 'vertigo' },
              { name: 'no future', value: 'no future' },
              { name: 'ICYMI', value: 'ICYMI' },
              { name: 'Champions', value: 'Champions' }
            )
        )
        .addStringOption((option) => option.setName('song').setDescription('The song that won!').setRequired(true))
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // only the Server Moderator role can use this command

  async execute(interaction) {
    try {
      const survivorChannel = interaction.guild.channels.cache.find((channel) => channel.name === process.env.SURVIVOR_CHANNEL_NAME);
      if (!survivorChannel) {
        const errEmbed = new EmbedBuilder().setDescription(`There is no channel named **${process.env.SURVIVOR_CHANNEL_NAME}** - please create one!`).setColor(process.env.ERROR_COLOR);
        return interaction.reply({ embeds: [errEmbed] });
      }

      const survivorPing = interaction.guild.roles.cache.get(process.env.SURVIVOR_ROLE_ID);
      const albumName = interaction.options.getString('album');

      const albumsFolder = path.resolve(__dirname, '../text-files/albums');
      let albumTracks = await lineSplitFile(`${albumsFolder}/${albumName}.txt`);
      const embedColor = `${albumTracks.pop()}`;
      const albumCover = albumTracks.pop();

      if (interaction.options.getSubcommand() === 'round') {
        const loser = interaction.options.getString('loser');

        // update the database
        const album = await Album.findOne({ album: albumName });
        if (!album) {
          // if the survivor album isn't already in the database, add it
          await Album.create({
            album: albumName,
            tracks: albumTracks
          });

          createSurvivorEmbed(albumTracks, true);
        } else {
          // if they already were in the database, remove the loser track
          if (loser) {
            if (!albumTracks.includes(loser)) {
              const errEmbed = new EmbedBuilder().setDescription(`**${loser}** is not a song in **${albumName}**, please try again!`).setColor(process.env.ERROR_COLOR);
              return interaction.reply({ embeds: [errEmbed] });
            }

            if (album.tracks.length == 2) {
              const errEmbed = new EmbedBuilder().setDescription(`There are only 2 songs left - use **/survivor winner**!`).setColor(process.env.ERROR_COLOR);
              return interaction.reply({ embeds: [errEmbed] });
            }

            if (!album.tracks.includes(loser)) {
              const errEmbed = new EmbedBuilder().setDescription(`**${loser}** was already eliminated!`).setColor(process.env.ERROR_COLOR);
              return interaction.reply({ embeds: [errEmbed] });
            }

            album.tracks.pull(loser);
            await album.save();
            albumTracks = album.tracks;
            createSurvivorEmbed(albumTracks, false);
          } else {
            // first round - no loser
            if (album.tracks.length < albumTracks.length) {
              const errEmbed = new EmbedBuilder().setDescription(`There is already a round of **${albumName}** Survivor!`).setColor(process.env.ERROR_COLOR);
              return interaction.reply({ embeds: [errEmbed] });
            }
            createSurvivorEmbed(albumTracks, true);
          }
        }

        async function createSurvivorEmbed(albumTracks, isFirstRound) {
          const numberEmojis = [
            '1️⃣',
            '2️⃣',
            '3️⃣',
            '4️⃣',
            '5️⃣',
            '6️⃣',
            '7️⃣',
            '8️⃣',
            '9️⃣',
            '🔟',
            '929631863549595658',
            '929631863440556043',
            '929631863520243784',
            '929634144667983892',
            '929634144777031690',
            '929634144588288020',
            '929634144537944064',
            '929634144491819018',
            '929634144487612416'
          ];

          const emojiTracks = [];
          albumTracks.forEach((track, index) => {
            if (numberEmojis[index].length === 18) {
              // length of a Discord emoji id
              let emoji = interaction.guild.emojis.cache.get(numberEmojis[index]);
              emojiTracks.push(`${emoji} ${track}`);
            } else {
              emojiTracks.push(`${numberEmojis[index]} ${track}`);
            }
          });

          const survivorEmbed = new EmbedBuilder()
            .setTitle(`**${albumName}** Survivor`)
            .setDescription(emojiTracks.join('\n\n'))
            .setThumbnail(albumCover)
            .setColor(embedColor)
            .setFooter({
              text: 'Vote for your LEAST favorite song!',
              iconURL: interaction.guild.iconURL({ dynamic: true })
            });

          if (!isFirstRound) {
            survivorEmbed.addFields([{ name: 'Eliminated Song', value: loser }]);
          }

          survivorChannel.send({ content: `${survivorPing}`, embeds: [survivorEmbed] }).then((message) => {
            for (let i = 0; i < albumTracks.length; i++) {
              message.react(numberEmojis[i]);
            }
          });

          const confirmEmbed = new EmbedBuilder().setDescription(`New round of **${albumName} Survivor** sent in ${survivorChannel}`).setColor(process.env.CONFIRM_COLOR);
          interaction.reply({ embeds: [confirmEmbed] });
        }
      } else if (interaction.options.getSubcommand() === 'winner') {
        const winner = interaction.options.getString('song');

        const album = await Album.findOne({ album: albumName });
        if (!album) {
          // if the survivor album isn't in the database, there was no survivor round; no winner possible
          const errEmbed = new EmbedBuilder().setDescription(`There is no current round of **${albumName}** Survivor.`).setColor(process.env.ERROR_COLOR);
          return interaction.reply({ embeds: [errEmbed] });
        } else {
          // if the album was already in the database, announce the winner and delete the survivor album from the database
          if (!albumTracks.includes(winner)) {
            const errEmbed = new EmbedBuilder().setDescription(`**${winner}** is not a song in **${albumName}**, please try again!`).setColor(process.env.ERROR_COLOR);
            return interaction.reply({ embeds: [errEmbed] });
          }

          if (!album.tracks.includes(winner)) {
            const errEmbed = new EmbedBuilder().setDescription(`**${winner}** was already eliminated, please try again!`).setColor(process.env.ERROR_COLOR);
            return interaction.reply({ embeds: [errEmbed] });
          }

          if (album.tracks.length > 2) {
            const errEmbed = new EmbedBuilder().setDescription(`There are still more than 2 songs left!`).setColor(process.env.ERROR_COLOR);
            return interaction.reply({ embeds: [errEmbed] });
          }

          album.tracks = albumTracks; // reset the album in the database
          await album.save();

          const winnerEmbed = new EmbedBuilder()
            .setTitle(`**${albumName}** Survivor - Winner!`)
            .setDescription(`👑 ${winner}`)
            .setThumbnail(albumCover)
            .setColor(embedColor)
            .setFooter({
              text: interaction.guild.name,
              iconURL: interaction.guild.iconURL({ dynamic: true })
            });

          survivorChannel.send({ content: `${survivorPing}`, embeds: [winnerEmbed] });

          const confirmEmbed = new EmbedBuilder().setDescription(`Winner of **${albumName} Survivor** sent in ${survivorChannel}`).setColor(process.env.CONFIRM_COLOR);
          return interaction.reply({ embeds: [confirmEmbed] });
        }
      }
    } catch (err) {
      sendErrorEmbed(interaction, err);
    }
  }
};
