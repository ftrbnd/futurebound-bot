// Interactions: slash commands, buttons, select menus
import { EmbedBuilder, InteractionType } from 'discord.js';
import { sendErrorEmbed } from '../utils/sendErrorEmbed.js';
import { getLeaderboard, sendRetryRequest, createLeaderboardDescription } from '../lib/heardle/api.js';
import { getSurvivorRound, removeDuplicateVote, updateVotes } from '../lib/mongo/services/SurvivorRound.js';
import { getGiveaway, updateGiveawayEntries } from '../lib/mongo/services/Giveaway.js';
import { deleteAllChecks, getDailyHeardleCheck } from '../lib/mongo/services/DailyHeardleCheck.js';
import { env } from '../utils/env.js';

export const name = 'interactionCreate';
export async function execute(interaction) {
  const leaderboardButtonIds = ['today', 'winPercentages', 'accuracies', 'currentStreaks', 'maxStreaks'];

  if (interaction.isStringSelectMenu() && interaction.channel.id == env.SURVIVOR_CHANNEL_ID) {
    await handleSurvivorVote(interaction); // handle menu interactions from /survivor
  } else if (interaction.isButton() && leaderboardButtonIds.includes(interaction.customId)) {
    await handleLeaderboardButton(interaction);
  } else if (interaction.isButton() && interaction.channel.id == env.GIVEAWAY_CHANNEL_ID) {
    await handleGiveawayEntry(interaction);
  } else if (interaction.isButton() && interaction.customId.startsWith('retry_daily_heardle')) {
    await handleRetryDailyHeardle(interaction);
  }

  if (!interaction.type === InteractionType.ApplicationCommand) return;

  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    const errorEmbed = new EmbedBuilder().setDescription('There was an error while executing this command!').setColor(env.ERROR_COLOR);
    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
  }
}

async function handleSurvivorVote(interaction) {
  let selectedSong = interaction.values[0];
  if (selectedSong == '$treams') selectedSong = ' $treams'; // Mongoose maps do not support keys that start with "$"

  const albumName = interaction.message.embeds[0].data.title.split('**')[1];

  let userChangedSong = false,
    originalVote = '';

  const survivorRound = await getSurvivorRound({ album: albumName });
  if (!survivorRound) {
    // this shouldn't be possible because users will only interact with the menu once a survivor round exists
    console.log('No survivor round data available.');
    const errEmbed = new EmbedBuilder().setDescription('An error occurred.').setColor(env.ERROR_COLOR);
    return interaction.reply({ embeds: [errEmbed], ephemeral: true });
  } else {
    if (interaction.message.id == survivorRound.lastMessageId) {
      // users have to vote in the most recent poll in the survivor channel
      // collect all user ids who have voted
      let allVotes = [];
      for (const song of survivorRound.votes.keys()) {
        allVotes.push(...survivorRound.votes.get(song));
      }

      // get all the votes for the song that the user selected
      const selectedSongVotes = survivorRound.votes.get(selectedSong);

      if (selectedSongVotes.includes(interaction.user.id)) {
        // happens if app client restarts or switch devices
        console.log(`Invalid vote: ${interaction.user.tag} voted for the same song`);
        const errorEmbed = new EmbedBuilder().setDescription(`You already selected **${selectedSong}**!`).setColor(env.ERROR_COLOR);
        return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      } else if (allVotes.includes(interaction.user.id)) {
        // if the user has already voted for a song
        // remove their original vote
        const { ogVote, changedSong } = await removeDuplicateVote(survivorRound, interaction.user.id);
        originalVote = ogVote;
        userChangedSong = changedSong;
      }

      selectedSongVotes.push(interaction.user.id); // add their vote once it's confirmed that their original vote has been removed
      await updateVotes(survivorRound, selectedSong, selectedSongVotes);
    } else {
      console.log(`Invalid vote: ${interaction.user.tag} voted in an old round`);
      const errorEmbed = new EmbedBuilder().setDescription('Please vote in the most recent poll!').setColor(env.ERROR_COLOR);
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    const userConfirmEmbed = new EmbedBuilder().setColor(env.CONFIRM_COLOR);

    if (userChangedSong) {
      console.log(`${interaction.user.tag} updated their vote from ${originalVote} to ${selectedSong}`);
      userConfirmEmbed.setDescription(`You updated your vote from **${originalVote}** to **${selectedSong}**`);
    } else {
      console.log(`${interaction.user.tag} voted for ${selectedSong}`);
      userConfirmEmbed.setDescription(`You selected **${selectedSong}**`);
    }

    return interaction.reply({ embeds: [userConfirmEmbed], ephemeral: true });
  }
}

// TODO: make environment variables
const premiumRoles = [
  '1048014115567837188', // Entrance
  '1048015082191335488', // Bipolar Paradise
  '1048015470168637440' // Final Call
];
async function handleGiveawayEntry(interaction) {
  const giveaway = await getGiveaway({ id: interaction.customId });

  if (giveaway.endDate.getTime() < new Date().getTime()) {
    const lateEmbed = new EmbedBuilder().setDescription('The giveaway has already ended!').setColor(env.ERROR_COLOR);
    return interaction.reply({ embeds: [lateEmbed], ephemeral: true });
  }

  if (giveaway.entries.includes(interaction.user.id)) {
    const enteredEmbed = new EmbedBuilder().setDescription('You have already entered the giveaway!').setColor(env.ERROR_COLOR);
    return interaction.reply({ embeds: [enteredEmbed], ephemeral: true });
  }

  const premiumRole = interaction.guild.roles.cache.get(premiumRoles.find((roleId) => interaction.member._roles.includes(roleId)));
  const additionalEntries = premiumRoles.indexOf(premiumRole.id) + 1;
  const description = await updateGiveawayEntries(giveaway, interaction.user.id, 1 + additionalEntries);

  const timestamp = `${giveaway.endDate.getTime()}`.substring(0, 10);
  const newEmbed = new EmbedBuilder()
    .setTitle(`Giveaway: ${giveaway.prize}`)
    .setDescription(giveaway.description)
    .addFields([{ name: 'End Date', value: `<t:${timestamp}>` }])
    .setColor(env.GIVEAWAY_COLOR)
    .setFooter({
      text: `${giveaway.entries.length} ${giveaway.entries.length == 1 ? 'entry' : 'entries'}`
    });
  if (giveaway.imageURL) newEmbed.setThumbnail(giveaway.imageURL);

  await interaction.message.edit({ embeds: [newEmbed] });

  const confirmEmbed = new EmbedBuilder().setDescription(description).setColor(env.CONFIRM_COLOR);

  await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });
}

async function handleLeaderboardButton(interaction) {
  await interaction.deferUpdate();

  const { leaderboard } = await getLeaderboard();

  const leaderboardEmbed = new EmbedBuilder().setURL('https://eden-heardle.io').setColor(0xf9d72f);
  const { title, description } = createLeaderboardDescription(leaderboard, interaction.customId);

  leaderboardEmbed.setTitle(title).setDescription(description);

  await interaction.editReply({ embeds: [leaderboardEmbed] });
}

async function handleRetryDailyHeardle(interaction) {
  try {
    await interaction.deferReply();

    // 'retry_daily_heardle_${status.id} => ['retry', 'daily', 'heardle', status.id]
    const statusId = interaction.customId.split('_')[3];

    const statusExists = await getDailyHeardleCheck({ id: statusId });
    if (!statusExists) {
      const errorEmbed = new EmbedBuilder().setDescription('Already sent retry request').setColor(env.ERROR_COLOR);

      return await interaction.editReply({ embeds: [errorEmbed] });
    }

    const { message } = await sendRetryRequest();
    await deleteAllChecks();

    const embed = new EmbedBuilder().setDescription(message).setColor(env.CONFIRM_COLOR);

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    await sendErrorEmbed(interaction, error, true);
  }
}
