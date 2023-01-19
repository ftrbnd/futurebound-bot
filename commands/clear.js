require('dotenv').config()

const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clear')
		.setDescription('Delete a certain amount of messages')
        .addIntegerOption(option =>
            option.setName('amount')
            .setDescription('The amount of messages to delete (1-100)')
            .setMinValue(1)
            .setMaxValue(100)
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),  // only the Server Moderator role can use this command
		
	async execute(interaction) {
        if(interaction.member.roles.cache.has(process.env.MODERATORS_ROLE_ID)) { // Moderator role
            const amountToDelete = interaction.options.getInteger('amount')

            interaction.channel.bulkDelete(amountToDelete, true)

            var amountDescription = `Successfully deleted ${amountToDelete} `
            if(amountToDelete === 1) amountDescription += 'message!'
            else amountDescription += 'messages!'
                
            const clearEmbed = new EmbedBuilder()
                .setDescription(amountDescription)
                .setColor('0x32ff25')
            interaction.reply({ embeds: [clearEmbed], ephemeral: true })
        } else {
            const permsEmbed = new EmbedBuilder()
                .setDescription('You do not have permission to use this command.')
                .setColor('0xdf0000')
            return interaction.reply({ embeds: [permsEmbed], ephemeral: true })
        }
	},
}