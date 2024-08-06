const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const getAllowedRoleId = require('../../../utils/getAllowedRoleId');
const sendErrorEmbed = require('../../../utils/sendErrorEmbed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription("Adjust the bot's volume for everyone")
    .addNumberOption((option) => option.setName('percent').setDescription('The volume percentage').setMinValue(0).setMaxValue(200).setRequired(true)),

  async execute(interaction) {
    try {
      const allowedRoleId = await getAllowedRoleId(interaction);
      if (!interaction.member._roles.includes(allowedRoleId) && allowedRoleId != interaction.guild.roles.everyone.id) {
        const errEmbed = new EmbedBuilder().setDescription(`You do not have permission to use music commands right now!`).setColor(process.env.ERROR_COLOR);
        return interaction.reply({ embeds: [errEmbed] });
      }

      const voiceChannel = interaction.member.voice.channel;
      if (!voiceChannel) {
        const errEmbed = new EmbedBuilder().setDescription(`You must join a voice channel!`).setColor(process.env.ERROR_COLOR);
        return interaction.reply({ embeds: [errEmbed] });
      }

      const percent = interaction.options.getNumber('percent');
      interaction.client.DisTube.setVolume(interaction.guild, percent);

      const volumeEmbed = new EmbedBuilder().setDescription(`Adjusted volume to **${percent}%**`).setColor(process.env.MUSIC_COLOR);
      interaction.reply({ embeds: [volumeEmbed] });
    } catch (err) {
      sendErrorEmbed(interaction, err);
    }
  }
};
