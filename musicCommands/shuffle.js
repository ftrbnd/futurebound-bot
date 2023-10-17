const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const getAllowedRoleId = require('../utils/getAllowedRoleId');
const sendErrorEmbed = require('../utils/sendErrorEmbed');

module.exports = {
  data: new SlashCommandBuilder().setName('shuffle').setDescription('Shuffle the queue'),

  async execute(interaction) {
    try {
      const allowedRoleId = await getAllowedRoleId(interaction);
      if (!interaction.member._roles.includes(allowedRoleId) && allowedRoleId != interaction.guild.roles.everyone.id) {
        const errEmbed = new EmbedBuilder().setDescription(`You do not have permission to use music commands right now!`).setColor(process.env.ERROR_COLOR);
        return interaction.reply({ embeds: [errEmbed] });
      }

      const voiceChannel = interaction.member.voice.channel;
      if (!voiceChannel) {
        const errEmbed = new EmbedBuilder().setDescription(`You must join a voice channel!`).setColor(process.env.ERROR_COLOR);
        return interaction.reply({ embeds: [errEmbed] });
      }

      const queue = interaction.client.DisTube.getQueue(interaction.guild);
      if (!queue) {
        const errEmbed = new EmbedBuilder().setDescription(`The queue is empty`).setColor(process.env.ERROR_COLOR);
        return interaction.reply({ embeds: [errEmbed] });
      }

      queue.shuffle();

      const shuffleEmbed = new EmbedBuilder().setDescription('Shuffled the queue').setColor(process.env.MUSIC_COLOR);
      interaction.reply({ embeds: [shuffleEmbed] });
    } catch (err) {
      sendErrorEmbed(interaction, err);
    }
  }
};
