import { ChatInputCommandInteraction, EmbedBuilder, TextChannel } from 'discord.js';
import { Colors } from './constants.js';
import { env } from './env.js';

/**
 * @param {ChatInputCommandInteraction} interaction
 * @param {Error} error
 * @param {boolean} deferred
 */
export const replyToInteraction = async (interaction, error, deferred = false) => {
  console.error(error);

  const errorEmbed = new EmbedBuilder().setTitle(error.name).setDescription(error.message).setColor(Colors.ERROR);

  if (deferred) await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
  else await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
};

/**
 * @param {ChatInputCommandInteraction} interaction
 * @param {Error} error
 * @param {TextChannel} channel
 */
export const sendMessageInLogChannel = async (interaction, error, channel = null) => {
  console.error(error);

  const errorEmbed = new EmbedBuilder().setTitle(error.name).setDescription(error.message).setColor(Colors.ERROR);

  if (channel) {
    await channel.send({ embeds: [errorEmbed] });
  } else {
    const logChannel = interaction.guild.channels.cache.get(env.LOGS_CHANNEL_ID);
    await logChannel.send({ embeds: [errorEmbed] });
  }
};
