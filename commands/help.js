const fs = require('fs')

const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Get a list of the commands for this bot'),
		
	async execute(interaction) {
		var commandList = ''
		const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
		for (const file of commandFiles) {
			commandList += `${file.replace('.js', '')}\n`
		}

		const helpEmbed = new EmbedBuilder()
			.setTitle(`Commands for ***${interaction.client.user.tag}***`)
			.setDescription(commandList)
			.setFooter({
				text: interaction.guild.name, 
				iconURL: interaction.guild.iconURL({ dynamic : true})
			})
			.setColor('0xf03200')

		interaction.reply({ embeds: [helpEmbed] })
	},
}