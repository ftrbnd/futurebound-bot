const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const MusicPermission = require('../../../schemas/MusicPermissionSchema');
const sendErrorEmbed = require('../../../utils/sendErrorEmbed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('permissions')
    .setDescription('Set music command permissions to @everyone or Server Moderators only')
    .addStringOption((option) =>
      option
        .setName('role')
        .setDescription('The role to grant music permission to')
        .setRequired(true)
        .addChoices({ name: '@Server Moderator', value: '691882703674540042' }, { name: '@everyone', value: '655655072885374987' })
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // only the Server Moderator role can use this command

  async execute(interaction) {
    try {
      const chosenRole = interaction.guild.roles.cache.get(interaction.options.getString('role'));

      const permissions = await MusicPermission.findOne({ role: chosenRole.id });
      if (!permissions) {
        await MusicPermission.create({
          roleName: chosenRole.name,
          roleId: chosenRole.id
        });
      } else {
        permissions.roleName = chosenRole.name;
        permissions.roleId = chosenRole.id;
        await permissions.save();
      }

      const confirmEmbed = new EmbedBuilder().setDescription(`Set music permissions to ${chosenRole}`).setColor(process.env.MUSIC_COLOR);
      interaction.reply({ embeds: [confirmEmbed] });
    } catch (err) {
      sendErrorEmbed(interaction, err);
    }
  }
};
