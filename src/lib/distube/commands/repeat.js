import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Colors } from '../../../utils/constants.js';
import { checkPermissionsAndVoiceStatus, checkQueue } from '../util.js';

export const data = new SlashCommandBuilder()
  .setName('repeat')
  .setDescription('Repeat the current song, queue, or turn repeat off')
  .addIntegerOption((option) =>
    option.setName('mode').setDescription('The repeat mode').setRequired(true).addChoices({ name: 'Off', value: 0 }, { name: 'Song', value: 1 }, { name: 'Queue', value: 2 })
  );

export async function execute(interaction) {
  await checkPermissionsAndVoiceStatus(interaction);
  const queue = await checkQueue(interaction);

  let mode = interaction.options.getInteger('mode');
  mode = queue.setRepeatMode(mode);

  let repeatMode = '';
  switch (mode) {
    case 0:
      repeatMode = 'Off';
      break;
    case 1:
      repeatMode = 'Song';
      break;
    case 2:
      repeatMode = 'Queue';
      break;
  }

  const repeatEmbed = new EmbedBuilder().setDescription(`Set repeat mode to **${repeatMode}**`).setColor(Colors.MUSIC);

  await interaction.reply({ embeds: [repeatEmbed] });
}
