import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import validateColor from 'validate-color';
import { env } from '../utils/env.js';

const { validateHTMLColorHex } = validateColor;

export const data = new SlashCommandBuilder()
  .setName('rolecolor')
  .setDescription('Set your custom color')
  .addStringOption((option) => option.setName('hex').setDescription('hex color code (ex: #8dbff3)').setRequired(true));

export async function execute(interaction) {
  if (!interaction.member.roles.cache.has(env.SUBSCRIBER_ROLE_ID)) {
    throw new Error('You are not a Server Subscriber!');
  }

  let color = interaction.options.getString('hex');
  if (!color.startsWith('#')) color = `#${color}`;

  if (!validateHTMLColorHex(color)) {
    throw new Error('Please enter a valid hex color code.');
  }

  const alreadyHasCustomColor = interaction.member.roles.cache.find((role) => role.name == 'Subscriber Custom Color');
  if (alreadyHasCustomColor) {
    const colorRole = interaction.member.roles.cache.find((role) => role.name == 'Subscriber Custom Color');

    colorRole.setColor(color);
  } else {
    const colorRole = await interaction.guild.roles.create({
      name: 'Subscriber Custom Color',
      color: color,
      position: interaction.guild.roles.cache.get(env.TIER_3_ROLE_ID).position + 1
    });

    interaction.member.roles.add(colorRole);
  }

  const verb = alreadyHasCustomColor ? 'Updated' : 'Set';
  const confirmEmbed = new EmbedBuilder().setDescription(`${verb} your custom color to ${color}`).setColor(color);

  await interaction.reply({ embeds: [confirmEmbed] });
}
