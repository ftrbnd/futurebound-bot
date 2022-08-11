require('dotenv').config()

const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('slowmode')
		.setDescription('Enable slowmode in a channel')
        .addChannelOption(option =>
            option.setName('channel')
            .setDescription('The channel to enable slowmode in')
            .setRequired(true))
        .addIntegerOption(option => 
            option.setName('seconds')
            .setDescription('The interval of seconds')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),  // only the Server Moderator role can use this command
		
	async execute(interaction) {
        if(interaction.member.roles.cache.has(process.env.MODERATORS_ROLE_ID)) { // Moderator role
            const targetChannel = interaction.options._hoistedOptions[0].channel
            const seconds = interaction.options._hoistedOptions[1].value

            targetChannel.setRateLimitPerUser(seconds)

            const slowmodeEmbed = new EmbedBuilder()
                .setDescription(`Enabled slowmode in ${targetChannel} for ${seconds} seconds`)
                .setColor(0x32ff25)

            interaction.reply({ embeds: [slowmodeEmbed], ephemeral: true })
        } else {
            const permsEmbed = new EmbedBuilder()
                .setDescription('You do not have permission to use this command.')
                .setColor(0xdf0000)
            return interaction.reply({ embeds: [permsEmbed], ephemeral: true })
        }
	},
}