import { resolve } from 'path';
import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { sendErrorEmbed } from '../utils/sendErrorEmbed.js';
import { lineSplitFile } from '../utils/lineSplitFile.js';
import { createAlbum, getAlbum, removeTrack, resetTracks } from '../lib/mongo/services/Album.js';
import { env } from '../utils/env.js';
import { Colors } from '../utils/constants.js';

const __dirname = import.meta.dirname;

export const data = new SlashCommandBuilder()
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
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
export async function execute(interaction) {
  try {
    const survivorChannel = interaction.guild.channels.cache.find((channel) => channel.id === env.SURVIVOR_CHANNEL_ID);
    if (!survivorChannel) {
      const errEmbed = new EmbedBuilder().setDescription(`There is no survivor channel - please create one!`).setColor(Colors.ERROR);
      return await interaction.reply({ embeds: [errEmbed] });
    }

    const survivorPing = interaction.guild.roles.cache.get(env.SURVIVOR_ROLE_ID);
    const albumName = interaction.options.getString('album');

    const albumsFolder = resolve(__dirname, '../text-files/albums');
    let albumTracks = await lineSplitFile(`${albumsFolder}/${albumName}.txt`);
    const embedColor = `${albumTracks.pop()}`;
    const albumCover = albumTracks.pop();

    if (interaction.options.getSubcommand() === 'round') {
      const loser = interaction.options.getString('loser');

      // update the database
      const album = await getAlbum({ album: albumName });
      if (!album) {
        // if the survivor album isn't already in the database, add it
        await createAlbum({
          album: albumName,
          tracks: albumTracks
        });

        await createSurvivorEmbed(albumTracks, true);
      } else {
        // if they already were in the database, remove the loser track
        if (loser) {
          if (!albumTracks.includes(loser)) {
            const errEmbed = new EmbedBuilder().setDescription(`**${loser}** is not a song in **${albumName}**, please try again!`).setColor(Colors.ERROR);
            return await interaction.reply({ embeds: [errEmbed] });
          }

          if (album.tracks.length == 2) {
            const errEmbed = new EmbedBuilder().setDescription(`There are only 2 songs left - use **/survivor winner**!`).setColor(Colors.ERROR);
            return await interaction.reply({ embeds: [errEmbed] });
          }

          if (!album.tracks.includes(loser)) {
            const errEmbed = new EmbedBuilder().setDescription(`**${loser}** was already eliminated!`).setColor(Colors.ERROR);
            return await interaction.reply({ embeds: [errEmbed] });
          }

          const updatedAlbum = await removeTrack(album, loser);
          albumTracks = updatedAlbum.tracks;
          await createSurvivorEmbed(albumTracks, false);
        } else {
          // first round - no loser
          if (album.tracks.length < albumTracks.length) {
            const errEmbed = new EmbedBuilder().setDescription(`There is already a round of **${albumName}** Survivor!`).setColor(Colors.ERROR);
            return await interaction.reply({ embeds: [errEmbed] });
          }
          await createSurvivorEmbed(albumTracks, true);
        }
      }

      async function createSurvivorEmbed(albumTracks, isFirstRound) {
        const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', ...env.NUMBER_EMOJIS];

        const emojiTracks = albumTracks.map((track, index) => {
          if (numberEmojis[index].length === 18) {
            // length of a Discord emoji id
            let emoji = interaction.guild.emojis.cache.get(numberEmojis[index]);
            return `${emoji} ${track}`;
          } else {
            return `${numberEmojis[index]} ${track}`;
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

        const message = await survivorChannel.send({ content: `${survivorPing}`, embeds: [survivorEmbed] });

        for (let i = 0; i < albumTracks.length; i++) {
          await message.react(numberEmojis[i]);
        }

        const confirmEmbed = new EmbedBuilder().setDescription(`New round of **${albumName} Survivor** sent in ${survivorChannel}`).setColor(Colors.CONFIRM);

        await interaction.reply({ embeds: [confirmEmbed] });
      }
    } else if (interaction.options.getSubcommand() === 'winner') {
      const winner = interaction.options.getString('song');

      const album = await getAlbum({ album: albumName });
      if (!album) {
        // if the survivor album isn't in the database, there was no survivor round; no winner possible
        const errEmbed = new EmbedBuilder().setDescription(`There is no current round of **${albumName}** Survivor.`).setColor(Colors.ERROR);
        return await interaction.reply({ embeds: [errEmbed] });
      }

      // if the album was already in the database, announce the winner and delete the survivor album from the database
      if (!albumTracks.includes(winner)) {
        const errEmbed = new EmbedBuilder().setDescription(`**${winner}** is not a song in **${albumName}**, please try again!`).setColor(Colors.ERROR);
        return await interaction.reply({ embeds: [errEmbed] });
      }

      if (!album.tracks.includes(winner)) {
        const errEmbed = new EmbedBuilder().setDescription(`**${winner}** was already eliminated, please try again!`).setColor(Colors.ERROR);
        return await interaction.reply({ embeds: [errEmbed] });
      }

      if (album.tracks.length > 2) {
        const errEmbed = new EmbedBuilder().setDescription(`There are still more than 2 songs left!`).setColor(Colors.ERROR);
        return await interaction.reply({ embeds: [errEmbed] });
      }

      await resetTracks(album, albumTracks);

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

      const confirmEmbed = new EmbedBuilder().setDescription(`Winner of **${albumName} Survivor** sent in ${survivorChannel}`).setColor(Colors.CONFIRM);

      await interaction.reply({ embeds: [confirmEmbed] });
    }
  } catch (err) {
    sendErrorEmbed(interaction, err);
  }
}
