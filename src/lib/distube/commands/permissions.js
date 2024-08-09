import { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { replyToInteraction } from '../../../utils/error-handler.js';
import { createMusicPermission, getMusicPermission, updatePermissionRole } from '../../mongo/services/MusicPermission.js';
import { Colors } from '../../../utils/constants.js';

export const data = new SlashCommandBuilder()
  .setName('permissions')
  .setDescription('Set music command permissions to @everyone or Server Moderators only')
  .addStringOption((option) =>
    option
      .setName('role')
      .setDescription('The role to grant music permission to')
      .setRequired(true)
      .addChoices({ name: '@Server Moderator', value: '691882703674540042' }, { name: '@everyone', value: '655655072885374987' })
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
export async function execute(interaction) {
  try {
    const chosenRole = interaction.guild.roles.cache.get(interaction.options.getString('role'));

    const permission = await getMusicPermission();
    if (permission) {
      await updatePermissionRole(chosenRole.name, chosenRole.id);
    } else {
      await createMusicPermission(chosenRole.name, chosenRole.id);
    }

    const confirmEmbed = new EmbedBuilder().setDescription(`Set music permissions to ${chosenRole}`).setColor(Colors.MUSIC);

    await interaction.reply({ embeds: [confirmEmbed] });
  } catch (err) {
    await replyToInteraction(interaction, err);
  }
}
