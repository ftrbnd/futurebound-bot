const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');
const { createClient } = require('@supabase/supabase-js');
const { SlashCommandBuilder, ButtonStyle } = require('discord.js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

function statusSquares(guesses) {
  function getStatusSquare(status) {
    switch (status) {
      case 'CORRECT':
        return '🟩';
      case 'ALBUM':
        return '🟧';
      case 'WRONG':
        return '🟥';
      default:
        return '⬜';
    }
  }

  let squares = [];
  guesses?.forEach((guess) => {
    squares.push(getStatusSquare(guess.correctStatus));
  });

  return squares.join('');
}

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
    .addSubcommand((subcommand) => subcommand.setName('leaderboard').setDescription('View the leaderboard')),

  async execute(interaction) {
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
      // GET LEADERBOARD
      const { data, error } = await supabase.from('Statistics').select();
      if (error) return console.log(error);
      console.log('LEADERBOARD: ', data);

      await interaction.reply({ content: 'TODO: Leaderboard' });
    }
  }
};
