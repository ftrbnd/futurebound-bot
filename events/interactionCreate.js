// Interactions: slash commands, buttons, select menus
const { MessageEmbed } = require('discord.js')

module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
        if (!interaction.isCommand()) return

        const command = interaction.client.commands.get(interaction.commandName)

        if (!command) return

        try {
            await command.execute(interaction)
        } catch (error) {
            console.error(error)
            const errorEmbed = new MessageEmbed()
                .setDescription('There was an error while executing this command!')
                .setColor(0xdf0000)
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true })
        }
	},
}