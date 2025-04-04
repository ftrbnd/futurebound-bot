import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Colors } from '../utils/constants.js';
import { setSocialCronSettings } from '../lib/mongo/services/Settings.js';

export const data = new SlashCommandBuilder()
  .setName('settings')
  .setDescription('Set bot preferences')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('crons')
      .setDescription('Enable/disable the Spotify and YouTube crons')
      .addBooleanOption((option) => option.setName('spotify').setDescription('Enable Spotify?').setRequired(true))
      .addBooleanOption((option) => option.setName('youtube').setDescription('Enable YouTube?').setRequired(true))
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

/**
 * @param {ChatInputCommandInteraction} interaction
 */
export async function execute(interaction) {
  if (interaction.options.getSubcommand() === 'crons') {
    const spotifyEnabled = interaction.options.getBoolean('spotify', true);
    const youtubeEnabled = interaction.options.getBoolean('youtube', true);

    await setSocialCronSettings(spotifyEnabled, youtubeEnabled);

    const embed = new EmbedBuilder()
      .setDescription(`Updated social cron settings`)
      .addFields([
        {
          name: 'Spotify',
          value: `${spotifyEnabled}`,
          inline: true
        },
        {
          name: 'YouTube',
          value: `${youtubeEnabled}`,
          inline: true
        }
      ])
      .setColor(Colors.CONFIRM);

    await interaction.reply({ embeds: [embed] });
  }
}
