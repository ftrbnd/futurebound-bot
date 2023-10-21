const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder, ButtonStyle } = require('discord.js');
const supabase = require('../lib/supabase');
const sendErrorEmbed = require('../utils/sendErrorEmbed');
const { statusSquares, statusSquaresLeaderboard, guessStatuses } = require('../utils/heardleStatusFunctions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('heardle')
    .setDescription('Get stats and leaderboard info from EDEN Heardle')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('stats')
        .setDescription('Get your own stats')
        .addUserOption((option) => option.setName('user').setDescription("Get this user's stats").setRequired(false))
    )
    .addSubcommand((subcommand) => subcommand.setName('leaderboard').setDescription('View the Top 10 leaderboard')),

  async execute(interaction) {
    try {
      if (interaction.options.getSubcommand() === 'stats') {
        const user = interaction.options.getUser('user');
        if (user) {
          // VIEW USER'S STATS
          const { data: accountData, error: accountError } = await supabase.from('Account').select().eq('providerAccountId', user.id);
          if (accountError || accountData.length === 0) {
            if (accountError) console.log(accountError);

            const errEmbed = new EmbedBuilder().setDescription('This user is not signed in to EDEN Heardle!').setColor(0xdf0000);

            return interaction.reply({ embeds: [errEmbed], ephemeral: true });
          }

          // Get today's results
          const { data: guessListData, error: guessListError } = await supabase.from('Guesses').select().eq('userId', accountData[0].userId);
          if (guessListError || guessListData.length === 0) {
            if (guessListError) console.log(guessListError);

            const errEmbed = new EmbedBuilder().setDescription('This user made any guesses!').setColor(0xdf0000);

            return interaction.reply({ embeds: [errEmbed], ephemeral: true });
          }
          const guessListId = guessListData[0].id;

          const { data: guesses, error: guessesError } = await supabase.from('GuessedSong').select().eq('guessListId', guessListId);
          if (guessesError) {
            if (guessListError) console.log(guessListError);

            const errEmbed = new EmbedBuilder().setDescription("Error getting user's guesses").setColor(0xdf0000);

            return interaction.reply({ embeds: [errEmbed], ephemeral: true });
          }

          // Get user's stats
          const { data: statsData, error: statsError } = await supabase.from('Statistics').select().eq('userId', accountData[0].userId);
          if (statsError || statsData.length === 0) {
            if (statsError) console.log(statsError);

            const errEmbed = new EmbedBuilder().setDescription("This user doesn't have any stats yet!").setColor(0xdf0000);

            return interaction.reply({ embeds: [errEmbed], ephemeral: true });
          }

          const stats = statsData[0];
          const completedDaily = guesses.length > 0 && (guesses.length === 6 || guesses.at(-1).correctStatus === 'CORRECT');

          const statsEmbed = new EmbedBuilder()
            .setAuthor({ name: user.displayName, iconURL: user.displayAvatarURL() })
            .setTitle('EDEN Heardle Stats')
            .setURL('https://eden-heardle.vercel.app')
            .setColor(0xf9d72f)
            .addFields(
              { name: 'Today', value: completedDaily ? statusSquares(guesses) : 'N/A' },
              { name: 'Win Percentage', value: `${Math.round(((stats?.gamesWon ?? 0) / (stats?.gamesPlayed || 1)) * 100)}%` },
              { name: 'Accuracy', value: `${Math.round(((stats?.accuracy ?? 0) / ((stats?.gamesPlayed || 1) * 6)) * 100)}%` },
              { name: 'Current Streak', value: `${stats.currentStreak}` },
              { name: 'Max Streak', value: `${stats.maxStreak}` }
            );

          await interaction.reply({ embeds: [statsEmbed] });
        } else {
          // CHECK YOUR OWN STATS
          const { data: accountData, error: accountError } = await supabase.from('Account').select().eq('providerAccountId', interaction.user.id);
          if (accountError || accountData.length === 0) {
            if (accountError) console.log(accountError);

            const errEmbed = new EmbedBuilder().setDescription('Your Discord account is not signed in to EDEN Heardle!').setColor(0xdf0000);

            return interaction.reply({ embeds: [errEmbed], ephemeral: true });
          }

          // Get today's results
          const { data: guessListData, error: guessListError } = await supabase.from('Guesses').select().eq('userId', accountData[0].userId);
          if (guessListError || guessListData.length === 0) {
            if (guessListError) console.log(guessListError);

            const errEmbed = new EmbedBuilder().setDescription("You haven't made any guesses!").setColor(0xdf0000);

            return interaction.reply({ embeds: [errEmbed], ephemeral: true });
          }
          const guessListId = guessListData[0].id;

          const { data: guesses, error: guessesError } = await supabase.from('GuessedSong').select().eq('guessListId', guessListId);
          if (guessesError) {
            if (guessListError) console.log(guessListError);

            const errEmbed = new EmbedBuilder().setDescription('Error getting your guesses').setColor(0xdf0000);

            return interaction.reply({ embeds: [errEmbed], ephemeral: true });
          }

          // Get your stats
          const { data: statsData, error: statsError } = await supabase.from('Statistics').select().eq('userId', accountData[0].userId);
          if (statsError || statsData.length === 0) {
            if (statsError) console.log(statsError);

            const errEmbed = new EmbedBuilder().setDescription("You don't have any stats yet!").setColor(0xdf0000);

            return interaction.reply({ embeds: [errEmbed], ephemeral: true });
          }

          const stats = statsData[0];
          const completedDaily = guesses.length > 0 && (guesses.length === 6 || guesses.at(-1).correctStatus === 'CORRECT');

          const statsEmbed = new EmbedBuilder()
            .setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL() })
            .setTitle('EDEN Heardle Stats')
            .setURL('https://eden-heardle.vercel.app')
            .setColor(0xf9d72f)
            .addFields(
              { name: 'Today', value: completedDaily ? statusSquares(guesses) : 'N/A' },
              { name: 'Win Percentage', value: `${Math.round(((stats?.gamesWon ?? 0) / (stats?.gamesPlayed || 1)) * 100)}%` },
              { name: 'Accuracy', value: `${Math.round(((stats?.accuracy ?? 0) / ((stats?.gamesPlayed || 1) * 6)) * 100)}%` },
              { name: 'Current Streak', value: `${stats.currentStreak}` },
              { name: 'Max Streak', value: `${stats.maxStreak}` }
            );

          await interaction.reply({ embeds: [statsEmbed] });
        }
      } else {
        // defer reply
        await interaction.deferReply();

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
            console.log(`Could not fetch member with id: ${discordId} `);
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

          // win percentages and accuracies
          if (userStats.gamesPlayed > 0) {
            leaderboard.winPcts.push({
              data: Math.round(((userStats?.gamesWon ?? 0) / (userStats?.gamesPlayed || 1)) * 100),
              user: guildMember
            });

            leaderboard.accuracies.push({
              data: Math.round(((userStats.accuracy ?? 0) / (userStats.gamesPlayed * 6)) * 100),
              user: guildMember
            });
          }

          // current streaks
          if (userStats.currentStreak > 0) {
            leaderboard.curStrks.push({
              data: userStats.currentStreak,
              user: guildMember
            });
          }

          // max streaks
          if (userStats.maxStreak > 0) {
            leaderboard.maxStrks.push({
              data: userStats.maxStreak,
              user: guildMember
            });
          }
        }

        leaderboard.dailies.sort((a, b) => {
          const aIndex = a.data.indexOf('CORRECT');
          const bIndex = b.data.indexOf('CORRECT');

          return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex); // if they didn't get the song, 'CORRECT' is not in any of their GuessedSongs, so return any number greater than 6 instead of -1
        });
        leaderboard.winPcts.sort((a, b) => b.data - a.data);
        leaderboard.accuracies.sort((a, b) => b.data - a.data);
        leaderboard.curStrks.sort((a, b) => b.data - a.data);
        leaderboard.maxStrks.sort((a, b) => b.data - a.data);

        const description = [];
        for (let i = 0; i < leaderboard.dailies.length; i++) {
          const daily = leaderboard.dailies[i];
          description.push(`${i + 1}. ${daily.user.displayName} **${statusSquaresLeaderboard(daily.data)}**`);
        }

        console.log('DESCRIPTION: ', description);

        const leaderboardEmbed = new EmbedBuilder()
          .setDescription(description.length > 0 ? description.join('\n') : "No one has completed today's Heardle yet!")
          .setTitle('EDEN Heardle Leaderboard - Today')
          .setURL('https://eden-heardle.vercel.app')
          .setColor(0xf9d72f);

        const dailies = new ButtonBuilder().setCustomId('dailies').setLabel('Today').setStyle(ButtonStyle.Primary);
        const winPcts = new ButtonBuilder().setCustomId('winPcts').setLabel('Win Percentages').setStyle(ButtonStyle.Primary);
        const accuracies = new ButtonBuilder().setCustomId('accuracies').setLabel('Accuracies').setStyle(ButtonStyle.Primary);
        const curStrks = new ButtonBuilder().setCustomId('curStrks').setLabel('Current Streaks').setStyle(ButtonStyle.Primary);
        const maxStrks = new ButtonBuilder().setCustomId('maxStrks').setLabel('Max Streaks').setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(dailies, winPcts, accuracies, curStrks, maxStrks);

        await interaction.editReply({ embeds: [leaderboardEmbed], components: [row] });
      }
    } catch (err) {
      sendErrorEmbed(interaction, err);
    }
  }
};
