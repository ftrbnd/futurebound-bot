import { resolve } from 'path';

import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { sendErrorEmbed } from '../utils/sendErrorEmbed.js';
import { lineSplitFile } from '../utils/lineSplitFile.js';
import { createSurvivorRound, getSurvivorRound, updateRoundAfterSend } from '../lib/mongo/services/SurvivorRound.js';
import { env } from '../utils/env.js';

const __dirname = import.meta.dirname;

export const data = new SlashCommandBuilder()
  .setName('survivormenu')
  .setDescription('New version of Survivor with menus and hidden votes')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('round')
      .setDescription('Start a new round of Survivor! (new version)')
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
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('standings')
      .setDescription('Get the current votes for this round')
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
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
export async function execute(interaction) {
  try {
    if (interaction.member.roles.cache.has(env.MODERATORS_ROLE_ID)) {
      // Moderator role
      const survivorChannel = interaction.guild.channels.cache.find((channel) => channel.id === env.SURVIVOR_CHANNEL_ID);
      if (!survivorChannel) {
        const errEmbed = new EmbedBuilder().setDescription(`There is no survivor channel - please create one!`).setColor(env.ERROR_COLOR);
        return interaction.reply({ embeds: [errEmbed] });
      }

      const albumName = interaction.options.getString('album');
      const albumsFolder = resolve(__dirname, '../text-files/albums');
      let albumTracks = await lineSplitFile(`${albumsFolder}/${albumName}.txt`); // get all of the album tracks
      const embedColor = `${albumTracks.pop()}`;
      const albumCover = albumTracks.pop();

      if (interaction.options.getSubcommand() === 'standings') {
        // get current votes
        const survivorRound = await getSurvivorRound({ album: albumName });
        if (!survivorRound) {
          const errEmbed = new EmbedBuilder().setDescription(`No data exists for **${albumName}**`).setColor(env.ERROR_COLOR);
          await interaction.reply({ embeds: [errEmbed] });
          return console.log(`No data exists for ${albumName}`);
        } else {
          // if data exists, get votes
          let totalVotes = 0;

          const songVotes = [];
          survivorRound.votes.forEach((userIds, song) => {
            // find the song with the most votes
            if (survivorRound.tracks.includes(song)) {
              // if the song hasn't been eliminated yet
              songVotes.push(`${song} - \`${userIds.length}\``);
              totalVotes += userIds.length;
            }
          });

          const standingsEmbed = new EmbedBuilder()
            .setTitle(`**${albumName}** Survivor - Round ${survivorRound.roundNumber} Standings`)
            .setDescription(songVotes.join('\n\n'))
            .setThumbnail(albumCover)
            .setColor(embedColor)
            .setFooter({
              text: `${totalVotes} total votes`
            });

          return interaction.reply({ embeds: [standingsEmbed] });
        }
      } else if (interaction.options.getSubcommand() === 'round') {
        if (interaction.channel == survivorChannel) {
          const errEmbed = new EmbedBuilder().setDescription(`Please use this command in ${interaction.guild.channels.cache.get(env.COMMANDS_CHANNEL_ID)}`).setColor(env.ERROR_COLOR);
          return interaction.reply({ embeds: [errEmbed], ephemeral: true });
        }

        const survivorRole = interaction.guild.roles.cache.get(env.SURVIVOR_ROLE_ID);
        let roundNumber, survivorEmbed, row;

        // update the database
        const survivorRound = await getSurvivorRound({ album: albumName });

        const songVotesMap = new Map(); // empty map with empty vote arrays for new rounds
        for (let track of albumTracks) {
          if (track == '$treams')
            // Mongoose maps do not support keys that start with "$"
            track = ' $treams';
          songVotesMap.set(`${track}`, new Array());
        }

        if (!survivorRound) {
          // if the survivor album isn't already in the database, add it
          await createSurvivorRound({
            album: albumName,
            tracks: albumTracks,
            votes: songVotesMap, // key:song, value: [userIds]
            standings: [],
            roundNumber: 1
          });
          console.log(`Created a new ${albumName} document in database`);
        } else {
          // if they already were in the database, compute the next round
          // find most voted song and remove it from current tracks list
          let mostVotedSong,
            max = 0,
            totalVotes = 0;
          survivorRound.votes.forEach((userIds, song) => {
            // find the song with the most votes
            if (userIds.length > max) {
              max = userIds.length;
              mostVotedSong = song;
            }
            if (survivorRound.tracks.includes(song)) totalVotes += userIds.length;
          });

          if (mostVotedSong == ' $treams')
            // Mongoose maps do not support keys that start with "$"
            mostVotedSong = '$treams';

          survivorRound.tracks.pull(mostVotedSong); // remove the most voted song from the database
          survivorRound.standings.push(mostVotedSong); // then add it to the standings - will reverse at the end
          survivorRound.votes = songVotesMap; // the loser song will still remain but this doesn't affect anything since it won't appear in voting list

          // compute the round number
          roundNumber = albumTracks.length - survivorRound.tracks.length + 1;

          if (data.tracks.length == 1) {
            // announce the winner if only one song left
            const standings = survivorRound.standings;
            standings.push(survivorRound.tracks[0]); // winner song
            standings.reverse(); // reverse the order
            standings.pop(); // remove the null element

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

            standings[0] = `👑 **${standings[0]}**`;
            for (let i = 1; i < standings.length; i++) {
              if (numberEmojis[i].length === 18) {
                // length of a Discord emoji id
                const emoji = interaction.guild.emojis.cache.get(numberEmojis[i]);
                standings[i] = `${emoji} ${standings[i]}`;
              } else {
                standings[i] = `${numberEmojis[i]} ${standings[i]}`;
              }
            }

            survivorEmbed = new EmbedBuilder()
              .setTitle(`**${albumName}** Survivor - Winner!`)
              .setDescription(standings.join('\n\n'))
              .setThumbnail(albumCover)
              .setColor(embedColor)
              .setFooter({
                text: `Runner-up: ${mostVotedSong} (${max} votes)`,
                iconURL: interaction.guild.iconURL({ dynamic: true })
              });

            const message = await survivorChannel.send({ content: `${survivorRole}`, embeds: [survivorEmbed] });
            await updateRoundAfterSend(survivorRound, message.id, roundNumber);

            survivorRound.tracks = albumTracks; // reset the database tracks
            survivorRound.votes.forEach((userIds) => {
              userIds = [];
            }); // clear all votes for next year's round
            survivorRound.standings = []; // reset setandings
          } else {
            // compute the next round
            // create the list of surviving songs for the next round embed description
            const tracksListDescription = [];
            survivorRound.tracks.forEach((track) => {
              tracksListDescription.push(`${track}`);
            });

            survivorEmbed = new EmbedBuilder()
              .setTitle(`**${albumName}** Survivor - Round ${roundNumber}`)
              .setDescription(tracksListDescription.join('\n\n'))
              .setThumbnail(albumCover)
              .setColor(embedColor);

            // if this isn't the first round then we have a song that was voted out
            if (mostVotedSong) {
              survivorEmbed.addFields([{ name: 'Eliminated Song', value: `${mostVotedSong} (${max} votes)` }]).setFooter({
                text: `${totalVotes} total votes`
              });
            }

            const options = [];
            for (const track of survivorRound.tracks) {
              // create the song options for the select menu
              const entries = new Map();
              entries.set('label', track);
              entries.set('value', track);
              const obj = Object.fromEntries(entries);
              options.push(obj);
            }

            row = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId('select').setPlaceholder('Vote for your LEAST favorite song!').addOptions(options));

            const message = await survivorChannel.send({ content: `${survivorRole}`, embeds: [survivorEmbed], components: [row] });
            // update the database with the newest round numbers and latest message id for reaction purposes
            await updateRoundAfterSend(survivorRound, message.id, roundNumber);
          }
        }

        const description = roundNumber > 0 ? `✅ ${survivorChannel}` : `Reset **${albumName}** document in database - use **/survivormenu** again`;
        const confirmEmbed = new EmbedBuilder().setColor(embedColor).setDescription(description);
        return interaction.reply({ embeds: [confirmEmbed] });
      }
    } else {
      const permsEmbed = new EmbedBuilder().setDescription('You do not have permission to use this command.').setColor(env.ERROR_COLOR);
      return interaction.reply({ embeds: [permsEmbed], ephemeral: true });
    }
  } catch (err) {
    sendErrorEmbed(interaction, err);
  }
}
