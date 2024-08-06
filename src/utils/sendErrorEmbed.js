import { EmbedBuilder } from 'discord.js';

export const sendErrorEmbed = async (interaction, error, deferred = false) => {
  const errorEmbed = new EmbedBuilder().setTitle(error.name).setDescription(error.message).setColor(process.env.ERROR_COLOR);

  console.log(error);
  if (deferred) await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
  else await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
};
