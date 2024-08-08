import { EmbedBuilder } from 'discord.js';
import { Colors } from './constants.js';

export const sendErrorEmbed = async (interaction, error, deferred = false) => {
  const errorEmbed = new EmbedBuilder().setTitle(error.name).setDescription(error.message).setColor(Colors.ERROR);

  console.log(error);
  if (deferred) await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
  else await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
};
