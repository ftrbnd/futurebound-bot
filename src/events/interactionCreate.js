// Interactions: slash commands, buttons, select menus
const { EmbedBuilder, InteractionType } = require('discord.js');
const SurvivorRound = require('../schemas/SurvivorRoundSchema');
const Giveaway = require('../schemas/GiveawaySchema');
const supabase = require('../lib/supabase');
const { statusSquaresLeaderboard, guessStatuses } = require('../utils/heardleStatusFunctions');
const sendErrorEmbed = require('../utils/sendErrorEmbed');
const DailyHeardleCheck = require('../schemas/DailyHeardleCheckSchema');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (interaction.isStringSelectMenu() && interaction.channel.name == process.env.SURVIVOR_CHANNEL_NAME) {
      await handleSurvivorVote(interaction); // handle menu interactions from /survivor
    }

    if (interaction.isButton() && interaction.channel.id == process.env.GIVEAWAY_CHANNEL_ID) {
      await handleGiveawayEntry(interaction);
    }

    const leaderboardButtonIds = ['dailies', 'winPcts', 'accuracies', 'curStrks', 'maxStrks'];
    if (interaction.isButton() && leaderboardButtonIds.includes(interaction.customId)) {
      await handleLeaderboardButton(interaction);
    }

    if (interaction.isButton() && interaction.customId.startsWith('retry_daily_heardle')) {
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
  const customId = interaction.customId;

  const leaderboardEmbed = new EmbedBuilder().setURL('https://eden-heardle.vercel.app').setColor(0xf9d72f);
  let description = [];

  // GET LEADERBOARD
  const { data: statsData, error: statsError } = await supabase.from('Statistics').select();
  if (statsError || statsData.length === 0) {
    if (statsError) console.log(statsError);

    const errEmbed = new EmbedBuilder().setDescription('No stats found').setColor(0xdf0000);

    return interaction.editReply({ embeds: [errEmbed], ephemeral: true });
  }

  const leaderboard = {
    dailies: [],
    winPcts: [],
    accuracies: [],
    curStrks: [],
    maxStrks: []
  };

  switch (customId) {
    case 'dailies':
      for (const userStats of statsData) {
        // GET DISCORD USER
        const { data: accountData, error: accountError } = await supabase.from('Account').select().eq('userId', userStats.userId);
        if (accountError) {
          console.log(accountError);

          const errEmbed = new EmbedBuilder().setDescription("Couldn't find Discord account for a user").setColor(0xdf0000);

          return interaction.editReply({ embeds: [errEmbed], ephemeral: true });
        }

        const discordId = accountData[0].providerAccountId;
        let guildMember = null;
        try {
          guildMember = await interaction.guild.members.fetch(discordId);
        } catch (err) {
          console.log(`Could not fetch member with id: ${discordId}`);
          continue;
        }

        const { data: guessesData, error: guessesError } = await supabase.from('Guesses').select().eq('userId', userStats.userId);
        if (guessesError) {
          console.log(guessesError);

          const errEmbed = new EmbedBuilder().setDescription('No guesses found').setColor(0xdf0000);

          return interaction.editReply({ embeds: [errEmbed], ephemeral: true });
        }

        const { data: guessedSongs, error: songsError } = await supabase.from('GuessedSong').select().eq('guessListId', guessesData[0].id);
        if (songsError || !guessedSongs) {
          console.log(songsError);

          const errEmbed = new EmbedBuilder().setDescription('Error getting guessed songs').setColor(0xdf0000);

          return interaction.editReply({ embeds: [errEmbed], ephemeral: true });
        }

        // daily stats
        if (guessedSongs.length > 0 && (guessedSongs.length === 6 || guessedSongs.at(-1)?.correctStatus === 'CORRECT')) {
          leaderboard.dailies.push({
            data: guessStatuses(guessedSongs),
            user: guildMember
          });
        }
      }

      leaderboard.dailies.sort((a, b) => {
        const aIndex = a.data.indexOf('CORRECT');
        const bIndex = b.data.indexOf('CORRECT');

        return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex); // if they didn't get the song, 'CORRECT' is not in any of their GuessedSongs, so return any number greater than 6 instead of -1
      });

      description = [];
      for (let i = 0; i < leaderboard.dailies.length; i++) {
        const daily = leaderboard.dailies[i];
        description.push(`${i + 1}. ${daily.user.displayName} **${statusSquaresLeaderboard(daily.data)}**`);
      }
      if (description.length > 10) description = description.slice(0, 10);
      leaderboardEmbed.setDescription(description.length > 0 ? description.join('\n') : "No one has completed today's Heardle yet!").setTitle('EDEN Heardle Leaderboard - Today');
      break;
    case 'winPcts':
      for (const userStats of statsData) {
        // GET DISCORD USER
        const { data: accountData, error: accountError } = await supabase.from('Account').select().eq('userId', userStats.userId);
        if (accountError) {
          console.log(accountError);

          const errEmbed = new EmbedBuilder().setDescription("Couldn't find Discord account for a user").setColor(0xdf0000);

          return interaction.editReply({ embeds: [errEmbed], ephemeral: true });
        }

        const discordId = accountData[0].providerAccountId;
        let guildMember = null;
        try {
          guildMember = await interaction.guild.members.fetch(discordId);
        } catch (err) {
          console.log(`Could not fetch member with id: ${discordId}`);
          continue;
        }

        if (userStats.gamesPlayed > 0) {
          leaderboard.winPcts.push({
            data: Math.round(((userStats?.gamesWon ?? 0) / (userStats?.gamesPlayed || 1)) * 100),
            user: guildMember
          });
        }
      }

      leaderboard.winPcts.sort((a, b) => b.data - a.data);

      description = [];
      for (let i = 0; i < leaderboard.winPcts.length; i++) {
        const winPct = leaderboard.winPcts[i];
        description.push(`${i + 1}. ${winPct.user.displayName} **${winPct.data}%**`);
      }
      if (description.length > 10) description = description.slice(0, 10);
      leaderboardEmbed.setDescription(description.length > 0 ? description.join('\n') : 'No one has won a game yet!').setTitle('EDEN Heardle Leaderboard - Win Percentages');
      break;
    case 'accuracies':
      for (const userStats of statsData) {
        // GET DISCORD USER
        const { data: accountData, error: accountError } = await supabase.from('Account').select().eq('userId', userStats.userId);
        if (accountError) {
          console.log(accountError);

          const errEmbed = new EmbedBuilder().setDescription("Couldn't find Discord account for a user").setColor(0xdf0000);

          return interaction.editReply({ embeds: [errEmbed], ephemeral: true });
        }

        const discordId = accountData[0].providerAccountId;
        let guildMember = null;
        try {
          guildMember = await interaction.guild.members.fetch(discordId);
        } catch (err) {
          console.log(`Could not fetch member with id: ${discordId}`);
          continue;
        }

        if (userStats.gamesPlayed > 0) {
          leaderboard.accuracies.push({
            data: Math.round(((userStats.accuracy ?? 0) / (userStats.gamesPlayed * 6)) * 100),
            user: guildMember
          });
        }
      }

      leaderboard.accuracies.sort((a, b) => b.data - a.data);

      description = [];
      for (let i = 0; i < leaderboard.accuracies.length; i++) {
        const accuracy = leaderboard.accuracies[i];
        description.push(`${i + 1}. ${accuracy.user.displayName} **${accuracy.data}%**`);
      }
      if (description.length > 10) description = description.slice(0, 10);
      leaderboardEmbed.setDescription(description.length > 0 ? description.join('\n') : 'No one has completed a game yet!').setTitle('EDEN Heardle Leaderboard - Accuracies');
      break;
    case 'curStrks':
      for (const userStats of statsData) {
        // GET DISCORD USER
        const { data: accountData, error: accountError } = await supabase.from('Account').select().eq('userId', userStats.userId);
        if (accountError) {
          console.log(accountError);

          const errEmbed = new EmbedBuilder().setDescription("Couldn't find Discord account for a user").setColor(0xdf0000);

          return interaction.editReply({ embeds: [errEmbed], ephemeral: true });
        }

        const discordId = accountData[0].providerAccountId;
        let guildMember = null;
        try {
          guildMember = await interaction.guild.members.fetch(discordId);
        } catch (err) {
          console.log(`Could not fetch member with id: ${discordId}`);
          continue;
        }

        // current streaks
        if (userStats.currentStreak > 0) {
          leaderboard.curStrks.push({
            data: userStats.currentStreak,
            user: guildMember
          });
        }
      }

      leaderboard.curStrks.sort((a, b) => b.data - a.data);

      description = [];
      for (let i = 0; i < leaderboard.curStrks.length; i++) {
        const streak = leaderboard.curStrks[i];
        description.push(`${i + 1}. ${streak.user.displayName} **${streak.data}**`);
      }
      if (description.length > 10) description = description.slice(0, 10);
      leaderboardEmbed.setDescription(description.length > 0 ? description.join('\n') : 'There are no active streaks.').setTitle('EDEN Heardle Leaderboard - Current Streaks');
      break;
    case 'maxStrks':
      for (const userStats of statsData) {
        // GET DISCORD USER
        const { data: accountData, error: accountError } = await supabase.from('Account').select().eq('userId', userStats.userId);
        if (accountError) {
          console.log(accountError);

          const errEmbed = new EmbedBuilder().setDescription("Couldn't find Discord account for a user").setColor(0xdf0000);

          return interaction.editReply({ embeds: [errEmbed], ephemeral: true });
        }

        const discordId = accountData[0].providerAccountId;
        let guildMember = null;
        try {
          guildMember = await interaction.guild.members.fetch(discordId);
        } catch (err) {
          console.log(`Could not fetch member with id: ${discordId}`);
          continue;
        }

        if (userStats.maxStreak > 0) {
          leaderboard.maxStrks.push({
            data: userStats.maxStreak,
            user: guildMember
          });
        }
      }

      leaderboard.maxStrks.sort((a, b) => b.data - a.data);

      description = [];
      for (let i = 0; i < leaderboard.maxStrks.length; i++) {
        const streak = leaderboard.maxStrks[i];
        description.push(`${i + 1}. ${streak.user.displayName} **${streak.data}**`);
      }
      if (description.length > 10) description = description.slice(0, 10);
      leaderboardEmbed.setDescription(description.length > 0 ? description.join('\n') : 'No max streaks available yet.').setTitle('EDEN Heardle Leaderboard - Max Streaks');
      break;
    default:
  }

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

    const res = await fetch(`${process.env.EDEN_HEARDLE_SERVER_URL}/api/heardles/daily`, {
      headers: {
        Authorization: `Bearer ${process.env.DISCORD_TOKEN}`
      }
    });
    if (!res.ok) throw new Error('Failed to send request');

    const { message } = await res.json();

    await DailyHeardleCheck.deleteMany({});
    const embed = new EmbedBuilder().setDescription(message).setColor(process.env.CONFIRM_COLOR);

    return await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    await sendErrorEmbed(interaction, error, true);
  }
}
