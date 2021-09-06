const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')

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
            .setRequired(true)),
		
	async execute(interaction) {
        if(interaction.member.roles.cache.has('691882703674540042')) { // Moderator role
            const targetChannel = interaction.options._hoistedOptions[0].channel
            const seconds = interaction.options._hoistedOptions[1].value

            targetChannel.setRateLimitPerUser(seconds)

            const slowmodeEmbed = new MessageEmbed()
                .setDescription(`Enabled slowmode in ${targetChannel} for ${seconds} seconds`)
                .setColor(0x32ff25)

            interaction.reply({ embeds: [slowmodeEmbed], ephemeral: true })
        } else {
            const permsEmbed = new MessageEmbed()
                .setDescription('You do not have permission to use this command.')
                .setColor(0xdf0000)
            return interaction.reply({ embeds: [permsEmbed], ephemeral: true })
        }
	},
}