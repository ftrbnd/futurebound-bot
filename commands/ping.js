const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const sendErrorEmbed = require('../utils/sendErrorEmbed');

module.exports = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Ping the EDEN Heardle server').setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    try {
      const owner = await interaction.guild.fetchOwner();
      if (interaction.member.id !== owner.id) {
        const embed = new EmbedBuilder().setDescription('You are not the server owner.').setColor(process.env.ERROR_COLOR);
        return interaction.reply({ embeds: [embed] });
      }

      await interaction.deferReply({ ephemeral: true });

      const res = await fetch(`${process.env.EDEN_HEARDLE_SERVER_URL}/api/heardles`);
      if (!res.ok) throw new Error('Failed to send request');

      const data = await res.json();

      const responseEmbed = new EmbedBuilder().setTitle(`${res.status} ${res.statusText}`).setDescription(JSON.stringify(data)).setColor(process.env.CONFIRM_COLOR);

      await interaction.editReply({ embeds: [responseEmbed], ephemeral: true });
    } catch (err) {
      sendErrorEmbed(interaction, err);
    }
  }
};
