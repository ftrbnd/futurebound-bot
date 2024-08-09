import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { replyToInteraction } from '../../../utils/error-handler.js';
import { Colors } from '../../../utils/constants.js';
import { checkPermissionsAndVoiceStatus } from '../util.js';

export const data = new SlashCommandBuilder()
  .setName('volume')
  .setDescription("Adjust the bot's volume for everyone")
  .addNumberOption((option) => option.setName('percent').setDescription('The volume percentage').setMinValue(0).setMaxValue(200).setRequired(true));
export async function execute(interaction) {
  try {
    await checkPermissionsAndVoiceStatus(interaction);

    const percent = interaction.options.getNumber('percent');
    interaction.client.DisTube.setVolume(interaction.guild, percent);

    const volumeEmbed = new EmbedBuilder().setDescription(`Adjusted volume to **${percent}%**`).setColor(Colors.MUSIC);

    await interaction.reply({ embeds: [volumeEmbed] });
  } catch (err) {
    await replyToInteraction(interaction, err);
  }
}
