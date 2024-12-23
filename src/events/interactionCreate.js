// Interactions: slash commands, buttons, select menus
import { ActionRowBuilder, EmbedBuilder, InteractionType, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { replyToInteraction } from '../utils/error-handler.js';
import { getLeaderboard, sendRetryRequest, createLeaderboardDescription } from '../lib/heardle/api.js';
import { getSurvivorRound, removeDuplicateVote, updateVotes } from '../lib/mongo/services/SurvivorRound.js';
import { getGiveaway, updateGiveawayEntries } from '../lib/mongo/services/Giveaway.js';
import { deleteAllChecks, getDailyHeardleCheck, updateAttemptCount } from '../lib/mongo/services/DailyHeardleCheck.js';
import { env } from '../utils/env.js';
import { Colors, HEARDLE_URL } from '../utils/constants.js';

export const name = 'interactionCreate';
export async function execute(interaction) {
  const leaderboardButtonIds = ['today', 'winPercentages', 'accuracies', 'currentStreaks', 'maxStreaks'];

  try {
    if (interaction.isStringSelectMenu() && interaction.channel.id == env.SURVIVOR_CHANNEL_ID) {
      await handleSurvivorVote(interaction); // handle menu interactions from /survivor
    } else if (interaction.isButton() && leaderboardButtonIds.includes(interaction.customId)) {
      await handleLeaderboardButton(interaction);
    } else if (interaction.isButton() && interaction.customId.includes('giveaway')) {
      await handleGiveawayEntry(interaction);
    } else if (interaction.isButton() && interaction.customId.includes('heardle')) {
      await handleHeardleError(interaction);
    } else if (interaction.isButton() && interaction.customId === 'qotd_suggest_button') {
      await handleQOTDButtonPress(interaction);
    } else if (interaction.isModalSubmit() && interaction.customId === 'qotd_submission_modal') {
      await handleQOTDModalSubmit(interaction);
    }

    if (!interaction.type === InteractionType.ApplicationCommand) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    await command.execute(interaction);
  } catch (error) {
    await replyToInteraction(interaction, error);
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
    throw new Error('No survivor round data available.');
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
        throw new Error(`You already selected **${selectedSong}**!`);
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
      throw new Error('Please vote in the most recent poll!');
    }

    const userConfirmEmbed = new EmbedBuilder().setColor(Colors.CONFIRM);

    if (userChangedSong) {
      console.log(`${interaction.user.tag} updated their vote from ${originalVote} to ${selectedSong}`);
      userConfirmEmbed.setDescription(`You updated your vote from **${originalVote}** to **${selectedSong}**`);
    } else {
      console.log(`${interaction.user.tag} voted for ${selectedSong}`);
      userConfirmEmbed.setDescription(`You selected **${selectedSong}**`);
    }

    await interaction.reply({ embeds: [userConfirmEmbed], ephemeral: true });
  }
}

async function handleGiveawayEntry(interaction) {
  const giveawayId = interaction.customId.split('_')[1];
  const giveaway = await getGiveaway(giveawayId);

  const now = new Date();

  if (giveaway.endDate.getTime() < now.getTime()) {
    throw new Error('The giveaway has already ended!');
  }

  if (giveaway.entries.includes(interaction.user.id)) {
    throw new Error('You have already entered this giveaway!');
  }

  const userPremiumRoleId = env.SUBSCRIBER_ROLE_IDS.find((roleId) => interaction.member.roles.cache.get(roleId));
  const additionalEntries = env.SUBSCRIBER_ROLE_IDS.indexOf(userPremiumRoleId) + 1;
  const description = await updateGiveawayEntries(giveaway, interaction.user.id, 1 + additionalEntries);

  const timestamp = `${giveaway.endDate.getTime()}`.substring(0, 10);
  const newEmbed = new EmbedBuilder()
    .setTitle(`Giveaway: ${giveaway.prize}`)
    .setDescription(giveaway.description)
    .addFields([{ name: 'End Date', value: `<t:${timestamp}>` }])
    .setColor(Colors.GIVEAWAY)
    .setFooter({
      text: `${giveaway.entries.length} ${giveaway.entries.length == 1 ? 'entry' : 'entries'}`
    });
  if (giveaway.imageURL) newEmbed.setThumbnail(giveaway.imageURL);

  await interaction.message.edit({ embeds: [newEmbed] });

  const confirmEmbed = new EmbedBuilder().setDescription(description).setColor(Colors.CONFIRM);

  await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });
}

async function handleLeaderboardButton(interaction) {
  await interaction.deferUpdate();

  const { leaderboard } = await getLeaderboard();

  const leaderboardEmbed = new EmbedBuilder().setURL(HEARDLE_URL).setColor(Colors.HEARDLE);
  const { title, description } = createLeaderboardDescription(leaderboard, interaction.customId);

  leaderboardEmbed.setTitle(title).setDescription(description);

  await interaction.editReply({ embeds: [leaderboardEmbed] });
}

async function handleHeardleError(interaction) {
  try {
    await interaction.deferReply();

    // '(retry | disable)_daily_heardle_${status.id} => ['retry' | 'disable, 'daily' | 'unlimited, 'heardle', status.id]
    const action = interaction.customId.split('_')[0];
    const heardleType = interaction.customId.split('_')[1];
    const statusId = interaction.customId.split('_')[3];

    if (action === 'retry') {
      if (heardleType === 'daily') {
        const statusExists = await getDailyHeardleCheck({ id: statusId });
        if (!statusExists) {
          throw new Error('This Daily Heardle check was deleted');
        }
      }

      const { message } = await sendRetryRequest(heardleType);

      let attempts = 0;
      if (heardleType === 'daily') attempts = await updateAttemptCount();

      const embed = new EmbedBuilder()
        .setTitle(message)
        .addFields(heardleType === 'daily' ? [{ name: 'Retry Attempts', value: `${attempts}` }] : [])
        .setColor(Colors.CONFIRM);

      await interaction.editReply({ embeds: [embed] });
    } else if (action === 'disable') {
      await deleteAllChecks();

      const embed = new EmbedBuilder().setDescription('Deleted this Daily Heardle check').setColor(Colors.CONFIRM);

      await interaction.editReply({ embeds: [embed] });
    }
  } catch (error) {
    await replyToInteraction(interaction, error, true);
  }
}

const textInputId = 'qotd_question_input';

async function handleQOTDButtonPress(interaction) {
  const modal = new ModalBuilder().setCustomId('qotd_submission_modal').setTitle('QOTD Question Submissions');
  const input = new TextInputBuilder().setCustomId(textInputId).setLabel('Submit your question idea!').setStyle(TextInputStyle.Paragraph).setRequired(true);
  const row = new ActionRowBuilder().addComponents(input);

  modal.addComponents(row);

  await interaction.showModal(modal);
}

async function handleQOTDModalSubmit(interaction) {
  const question = interaction.fields.getTextInputValue(textInputId);

  const channel = interaction.guild.channels.cache.get(env.QOTD_SUBMISSIONS_CHANNEL_ID);
  const submissionEmbed = new EmbedBuilder()
    .setTitle('New Submission')
    .setDescription(`"${question}"`)
    .setFooter({
      text: `submitted by ${interaction.user.displayName ?? interaction.user.username}`,
      iconURL: interaction.user.avatarURL()
    })
    .setColor(Colors.QOTD)
    .setTimestamp();
  await channel.send({ embeds: [submissionEmbed] });

  const confirmEmbed = new EmbedBuilder()
    .setTitle('Thank you for submitting your question!')
    .setDescription(`"${question}"`)
    .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
    .setColor(Colors.CONFIRM);
  await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });
}
