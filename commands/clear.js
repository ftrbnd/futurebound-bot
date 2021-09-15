require('dotenv').config()

const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clear')
		.setDescription('Delete a certain amount of messages')
        .addIntegerOption(option =>
            option.setName('amount')
            .setDescription('The amount of messages to delete (1-100)')
            .setRequired(true)),
		
	async execute(interaction) {
        if(interaction.member.roles.cache.has(process.env.MODERATORS_ROLE_ID)) { // Moderator role
            const amountToDelete = interaction.options._hoistedOptions[0].value

            const errorEmbed = new MessageEmbed()
                .setDescription('Enter a value between 1-100.')
                .setColor(0x32ff25)      
            if(amountToDelete < 1 || amountToDelete > 100)
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true })

            interaction.channel.bulkDelete(amountToDelete, true)

            var amountDescription = `Successfully deleted ${amountToDelete} `
            if(amountToDelete === 1) amountDescription += 'message!'
            else amountDescription += 'messages!'
                
            const clearEmbed = new MessageEmbed()
                .setDescription(amountDescription)
                .setColor(0x32ff25)
            interaction.reply({ embeds: [clearEmbed], ephemeral: true })
        } else {
            const permsEmbed = new MessageEmbed()
                .setDescription('You do not have permission to use this command.')
                .setColor(0xdf0000)
            return interaction.reply({ embeds: [permsEmbed], ephemeral: true })
        }
	},
}