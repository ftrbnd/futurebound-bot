const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dm')
		.setDescription('DM a message to a user')
        .addUserOption(option =>
            option.setName('user')
            .setDescription('The user to message')
            .setRequired(true))
        .addStringOption(option => 
            option.setName('message')
            .setDescription('What the bot should send')
            .setRequired(true)),
		
	async execute(interaction) {
        if(interaction.member.roles.cache.has('691882703674540042')) { // Moderator role
            const targetUser = interaction.options._hoistedOptions[0].user
            const messageToSend = interaction.options._hoistedOptions[1].value
            targetUser.send(messageToSend).catch(console.error)

            const sentEmbed = new MessageEmbed()
                .setDescription(`Sent **"${messageToSend}"** to ${targetUser}`)
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