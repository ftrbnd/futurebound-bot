// Interactions: slash commands, buttons, select menus
const { EmbedBuilder, InteractionType } = require('discord.js');
const SurvivorRound = require('../schemas/SurvivorRoundSchema');
const Giveaway = require('../schemas/GiveawaySchema');
const sendErrorEmbed = require('../utils/sendErrorEmbed');
const DailyHeardleCheck = require('../schemas/DailyHeardleCheckSchema');
const { getLeaderboard, sendRetryRequest, createLeaderboardDescription } = require('../lib/heardle-api');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    const leaderboardButtonIds = ['today', 'winPercentages', 'accuracies', 'currentStreaks', 'maxStreaks'];

    if (interaction.isStringSelectMenu() && interaction.channel.name == process.env.SURVIVOR_CHANNEL_NAME) {
      await handleSurvivorVote(interaction); // handle menu interactions from /survivor
    } else if (interaction.isButton() && leaderboardButtonIds.includes(interaction.customId)) {
      await handleLeaderboardButton(interaction);
    } else if (interaction.isButton() && interaction.channel.id == process.env.GIVEAWAY_CHANNEL_ID) {
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
      const errorEmbed = new EmbedBuilder().setDescription('There was an error while executing this command!').setColor(process.env.ERROR_COLOR);
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
};

async function handleSurvivorVote(interaction) {
  let selectedSong = interaction.values[0];
  if (selectedSong == '$treams') selectedSong = ' $treams'; // Mongoose maps do not support keys that start with "$"

  const albumName = interaction.message.embeds[0].data.title.split('**')[1];

  let userChangedSong = false,
    originalVote = '';

  const survivorRound = await SurvivorRound.findOne({ album: albumName });
  if (!survivorRound) {
    // this shouldn't be possible because users will only interact with the menu once a survivor round exists
    console.log('No survivor round data available.');
    const errEmbed = new EmbedBuilder().setDescription('An error occured.').setColor(process.env.ERROR_COLOR);
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
        const errorEmbed = new EmbedBuilder().setDescription(`You already selected **${selectedSong}**!`).setColor(process.env.ERROR_COLOR);
        return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      } else if (allVotes.includes(interaction.user.id)) {
        // if the user has already voted for a song
        // remove their original vote
        survivorRound.votes.forEach((userIds, song) => {
          if (userIds.includes(interaction.user.id)) {
            originalVote = song;
            userIds.splice(userIds.indexOf(interaction.user.id), 1); // remove the user's id from the original song's vote list
            userChangedSong = true;
          }
        });
      }

      selectedSongVotes.push(interaction.user.id); // add their vote once it's confirmed that their original vote has been removed
      survivorRound.votes.set(selectedSong, selectedSongVotes); // add the new votes list to the database
      await survivorRound.save();
    } else {
      console.log(`Invalid vote: ${interaction.user.tag} voted in an old round`);
      const errorEmbed = new EmbedBuilder().setDescription('Please vote in the most recent poll!').setColor(process.env.ERROR_COLOR);
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    const userConfirmEmbed = new EmbedBuilder().setColor(process.env.CONFIRM_COLOR);

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

async function handleGiveawayEntry(interaction) {
  const giveaway = await Giveaway.findByIdAndUpdate(interaction.customId);

  if (giveaway.endDate.getTime() < new Date().getTime()) {
    const lateEmbed = new EmbedBuilder().setDescription('The giveaway has already ended!').setColor(process.env.ERROR_COLOR);
    return interaction.reply({ embeds: [lateEmbed], ephemeral: true });
  }

  if (giveaway.entries.includes(interaction.user.id)) {
    const enteredEmbed = new EmbedBuilder().setDescription('You have already entered the giveaway!').setColor(process.env.ERROR_COLOR);
    return interaction.reply({ embeds: [enteredEmbed], ephemeral: true });
  }

  const premiumRoles = [
    '1048015470168637440', // Final Call
    '1048015082191335488', // Bipolar Paradise
    '1048014115567837188' // Entrance
  ];
  const premiumRole = interaction.guild.roles.cache.get(premiumRoles.find((roleId) => interaction.member._roles.includes(roleId)));

  let subscriberMessage;
  if (premiumRole) {
    switch (
      premiumRole.id // subscribers get more entries
    ) {
      case premiumRoles[0]:
        giveaway.entries.push(interaction.user.id);
        giveaway.entries.push(interaction.user.id);
        giveaway.entries.push(interaction.user.id);
        subscriberMessage = 'Thank you for being a Server Subscriber, you get 3 extra entries! (4 total)';
        break;
      case premiumRoles[1]:
        giveaway.entries.push(interaction.user.id);
        giveaway.entries.push(interaction.user.id);
        subscriberMessage = 'Thank you for being a Server Subscriber, you get 2 extra entries! (3 total)';
        break;
      case premiumRoles[2]:
        giveaway.entries.push(interaction.user.id);
        subscriberMessage = 'Thank you for being a Server Subscriber, you get 1 extra entry! (2 total)';
        break;
    }
  }
  giveaway.entries.push(interaction.user.id);

  await giveaway.save();

  const timestamp = `${giveaway.endDate.getTime()}`.substring(0, 10);
  const newEmbed = new EmbedBuilder()
    .setTitle(`Giveaway: ${giveaway.prize}`)
    .setDescription(giveaway.description)
    .addFields([{ name: 'End Date', value: `<t:${timestamp}>` }])
    .setColor(process.env.GIVEAWAY_COLOR)
    .setFooter({
      text: `${giveaway.entries.length} ${giveaway.entries.length == 1 ? 'entry' : 'entries'}`
    });
  if (giveaway.imageURL) newEmbed.setThumbnail(giveaway.imageURL);

  await interaction.message.edit({ embeds: [newEmbed] });

  const confirmEmbed = new EmbedBuilder().setDescription(`Entry confirmed! ${subscriberMessage ?? ''}`).setColor(process.env.CONFIRM_COLOR);
  interaction.reply({ embeds: [confirmEmbed], ephemeral: true });
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

    const statusExists = await DailyHeardleCheck.findById(statusId);
    if (!statusExists) {
      const errorEmbed = new EmbedBuilder().setDescription('Already sent retry request').setColor(process.env.ERROR_COLOR);

      return await interaction.editReply({ embeds: [errorEmbed] });
    }

    const { message } = await sendRetryRequest();

    await DailyHeardleCheck.deleteMany({});
    const embed = new EmbedBuilder().setDescription(message).setColor(process.env.CONFIRM_COLOR);

    return await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    await sendErrorEmbed(interaction, error, true);
  }
}
