import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Colors } from '../utils/constants.js';
import { env } from '../utils/env.js';
import { createQOTD, getDailyNumber } from '../lib/mongo/services/QOTD.js';

export const data = new SlashCommandBuilder()
  .setName('qotd')
  .setDescription('Start a new QOTD')
  .addStringOption((option) => option.setName('question').setDescription('Question of the day').setRequired(true))
  .addUserOption((option) => option.setName('user').setDescription('Was this question submitted by another user?').setRequired(false));

/**
 *
 * @param {ChatInputCommandInteraction} interaction
 */
export async function execute(interaction) {
  if (!env.QOTD_ALLOWED_USER_IDS.includes(interaction.user.id)) {
    throw new Error("You don't have permission to start QOTDs!");
  }

  const submissionUser = interaction.options.getUser('user');
  const creditedUser = submissionUser ?? interaction.user;

  const role = interaction.guild.roles.cache.get(env.QOTD_ROLE_ID);
  const question = interaction.options.getString('question');
  const channel = interaction.guild.channels.cache.get(env.QOTD_CHANNEL_ID);

  const dailyNumber = await getDailyNumber();
  const qotdEmbed = new EmbedBuilder()
    .setTitle(`Question of the Day #${dailyNumber}`)
    .setDescription(question)
    .setColor(Colors.RANDOM)
    .setFooter({
      text: `submitted by ${creditedUser.displayName ?? creditedUser.username}`,
      iconURL: creditedUser.avatarURL()
    })
    .setTimestamp();
  const message = await channel.send({ content: `${role}`, embeds: [qotdEmbed] });
  await message.startThread({
    name: `QOTD #${dailyNumber}`
  });

  await createQOTD(question, message, creditedUser);

  const confirmEmbed = new EmbedBuilder().setTitle(`Successfully sent QOTD #${dailyNumber} to ${channel}`).setDescription(question).setColor(Colors.CONFIRM).setTimestamp();
  await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });
}
