const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('say')
		.setDescription('Make the bot say something')
        .addChannelOption(option =>
            option.setName('channel')
            .setDescription('The channel the message should be sent in')
            .setRequired(true))
        .addStringOption(option => 
            option.setName('message')
            .setDescription('What the bot should say')
            .setRequired(true)),
		
	async execute(interaction) {
        if(interaction.member.roles.cache.has('691882703674540042')) { // Moderator role
            const targetChannel = interaction.options._hoistedOptions[0].channel
            const messageToSend = interaction.options._hoistedOptions[1].value
            targetChannel.send(messageToSend)

            const sentEmbed = new MessageEmbed()
                .setDescription(`Said **"${messageToSend}"** in ${targetChannel}`)
                .setColor(0x32ff25)

            interaction.reply({ embeds: [sentEmbed] })
        } else {
            const permsEmbed = new MessageEmbed()
                .setDescription('You do not have permission to use this command.')
                .setColor(0xdf0000)
            return interaction.reply({ embeds: [permsEmbed], ephemeral: true })
        }
	},
}