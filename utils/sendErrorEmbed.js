const { EmbedBuilder } = require('discord.js');

const sendErrorEmbed = async (interaction, error) => {
  const errorEmbed = new EmbedBuilder().setTitle(error.name).setDescription(error.message).setColor(process.env.ERROR_COLOR);

  console.log(error);
  interaction.reply({ embeds: [errorEmbed], ephemeral: true });
};

module.exports = sendErrorEmbed;
