const { ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const sendErrorEmbed = require('../utils/sendErrorEmbed');
const { statusSquares } = require('../utils/heardleStatusFunctions');
const { getUserStats, getLeaderboard, createLeaderboardDescription, setAnnouncement } = require('../lib/heardle-api');

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
    .addSubcommand((subcommand) => subcommand.setName('leaderboard').setDescription('View the Top 10 leaderboard'))
    .addSubcommand((subcommand) =>
      subcommand
        .setName('set-announcement')
        .setDescription("Set the website's announcement")
        .addBooleanOption((option) => option.setName('show_banner').setDescription('Whether to show the announcement banner on the website'))
        .addStringOption((option) => option.setName('text').setDescription('The announcement text'))
        .addStringOption((option) => option.setName('link').setDescription('The link to open when clicked').setRequired(false))
        .addStringOption((option) =>
          option
            .setName('status')
            .setDescription("The status determines the banner's color")
            .addChoices({ name: 'Success', value: 'success' }, { name: 'Info', value: 'info' }, { name: 'Error', value: 'error' })
        )
    ),

  async execute(interaction) {
    try {
      if (interaction.options.getSubcommand() === 'stats') {
        const user = interaction.options.getUser('user') ?? interaction.user;
        const { guesses, statistics } = await getUserStats(user);

        const completedDaily = guesses.length > 0 && (guesses.length === 6 || guesses.at(-1).correctStatus === 'CORRECT');

        const statsEmbed = new EmbedBuilder()
          .setAuthor({ name: user.displayName, iconURL: user.displayAvatarURL() })
          .setTitle('EDEN Heardle Stats')
          .setURL('https://eden-heardle.io')
          .setColor(0xf9d72f)
          .addFields(
            { name: 'Today', value: completedDaily ? statusSquares(guesses) : 'N/A' },
            { name: 'Win Percentage', value: `${Math.round(((statistics?.gamesWon ?? 0) / (statistics?.gamesPlayed || 1)) * 100)}%` },
            { name: 'Accuracy', value: `${Math.round(((statistics?.accuracy ?? 0) / ((statistics?.gamesPlayed || 1) * 6)) * 100)}%` },
            { name: 'Current Streak', value: `${statistics.currentStreak}` },
            { name: 'Max Streak', value: `${statistics.maxStreak}` }
          );

        await interaction.reply({ embeds: [statsEmbed] });
      } else if (interaction.options.getSubcommand() === 'leaderboard') {
        const { leaderboard } = await getLeaderboard();
        const { title, description } = createLeaderboardDescription(leaderboard, 'today');

        const leaderboardEmbed = new EmbedBuilder().setDescription(description).setTitle(title).setURL('https://www.eden-heardle.io').setColor(0xf9d72f);

        const today = new ButtonBuilder().setCustomId('today').setLabel('Today').setStyle(ButtonStyle.Primary);
        const winPercentages = new ButtonBuilder().setCustomId('winPercentages').setLabel('Win Percentages').setStyle(ButtonStyle.Primary);
        const accuracies = new ButtonBuilder().setCustomId('accuracies').setLabel('Accuracies').setStyle(ButtonStyle.Primary);
        const currentStreaks = new ButtonBuilder().setCustomId('currentStreaks').setLabel('Current Streaks').setStyle(ButtonStyle.Primary);
        const maxStreaks = new ButtonBuilder().setCustomId('maxStreaks').setLabel('Max Streaks').setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(today, winPercentages, accuracies, currentStreaks, maxStreaks);

        await interaction.reply({ embeds: [leaderboardEmbed], components: [row] });
      } else if (interaction.options.getSubcommand() === 'set-announcement') {
        const owner = await interaction.guild.fetchOwner();
        if (interaction.member.id !== owner.id) {
          const embed = new EmbedBuilder().setDescription('You are not the server owner.').setColor(process.env.ERROR_COLOR);
          return interaction.reply({ embeds: [embed] });
        }

        const showBanner = interaction.options.getBoolean('show_banner');
        const text = interaction.options.getString('text');
        const link = interaction.options.getString('link');
        const status = interaction.options.getString('status');

        const announcement = await setAnnouncement(showBanner, text, link, status);

        const confirmEmbed = new EmbedBuilder()
          .setTitle('[EDEN Heardle] New Announcement')
          .setColor(process.env.CONFIRM_COLOR)
          .addFields([
            { name: 'show_banner', value: `${announcement.showBanner}`, inline: true },
            { name: 'text', value: announcement.text, inline: true },
            { name: 'link', value: `${announcement.link}`, inline: true },
            { name: 'status', value: announcement.status, inline: true }
          ])
          .setURL('https://eden-heardle.io/play')
          .setColor(process.env.CONFIRM_COLOR);

        await interaction.reply({ embeds: [confirmEmbed] });
      }
    } catch (err) {
      sendErrorEmbed(interaction, err);
    }
  }
};
