import { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { env } from '../utils/env.js';
import { Colors } from '../utils/constants.js';

export const data = new SlashCommandBuilder()
  .setName('lockdown')
  .setDescription('In the event of large amounts of spam')
  .addSubcommand((subcommand) => subcommand.setName('close').setDescription('Close all text channels'))
  .addSubcommand((subcommand) => subcommand.setName('open').setDescription('Re-open all text channels'))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles);

export async function execute(interaction) {
  const roles = [...env.ALBUM_ROLE_IDS, env.BOOSTER_ROLE_ID].map((roleId) => interaction.guild.roles.cache.get(roleId));

  if (interaction.options.getSubcommand() === 'close') {
    // Close all text channels
    const removedPermissions = [
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.CreateInstantInvite,
      PermissionFlagsBits.ChangeNickname,
      PermissionFlagsBits.AddReactions,
      PermissionFlagsBits.UseExternalEmojis,
      PermissionFlagsBits.UseExternalStickers,
      PermissionFlagsBits.ReadMessageHistory,
      PermissionFlagsBits.Connect,
      PermissionFlagsBits.Speak,
      PermissionFlagsBits.Stream,
      PermissionFlagsBits.UseVAD,
      PermissionFlagsBits.RequestToSpeak
    ];

    roles.forEach((role) => role.setPermissions(removedPermissions));

    const confirmEmbed = new EmbedBuilder().setDescription(`**${interaction.guild.name}** is now on lockdown.`).setColor(Colors.ERROR);

    await interaction.reply({ embeds: [confirmEmbed] });
  } else if (interaction.options.getSubcommand() === 'open') {
    // Open all text channels
    const defaultPermissions = [
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.CreateInstantInvite,
      PermissionFlagsBits.ChangeNickname,
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.SendMessagesInThreads,
      PermissionFlagsBits.EmbedLinks,
      PermissionFlagsBits.AttachFiles,
      PermissionFlagsBits.AddReactions,
      PermissionFlagsBits.UseExternalEmojis,
      PermissionFlagsBits.UseExternalStickers,
      PermissionFlagsBits.ReadMessageHistory,
      PermissionFlagsBits.UseApplicationCommands,
      PermissionFlagsBits.Connect,
      PermissionFlagsBits.Speak,
      PermissionFlagsBits.Stream,
      PermissionFlagsBits.UseVAD,
      PermissionFlagsBits.RequestToSpeak
    ];

    roles.forEach((role) => {
      role.setPermissions(defaultPermissions);
    });

    const confirmEmbed = new EmbedBuilder().setDescription(`**${interaction.guild.name}** is now open!`).setColor(Colors.CONFIRM);

    await interaction.reply({ embeds: [confirmEmbed] });
  }
}
