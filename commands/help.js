const fs = require('fs')

const { EmbedBuilder, SlashCommandBuilder, ActivityFlagsBitField } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Get a list of the commands for this bot'),
		
	async execute(interaction) {
		var helpEmbed = new EmbedBuilder()
			.setTitle(`Commands for ***${interaction.client.user.tag}***`)
			.setFooter({
				text: interaction.guild.name, 
				iconURL: interaction.guild.iconURL({ dynamic : true})
			})
			.setColor('0xf03200')
		
		var everyoneCommandsList = ''
		var helperCommandsList = ''
		var modCommandsList = ''
		const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
		for (const file of commandFiles) {
			const command = require(`./${file}`)

			if (!command.data.default_member_permissions) { // if the command has no Helper/Mod permissions required
				everyoneCommandsList += `/${file.replace('.js', '')}\n`
			} else if (command.data.default_member_permissions === '268435456') { // Helper command
				helperCommandsList += `/${file.replace('.js', '')}\n`
			} else if (command.data.default_member_permissions === '8') { // Moderator command
				modCommandsList += `/${file.replace('.js', '')}\n`
			}
		}

		if(interaction.member.roles.cache.has(process.env.MODERATORS_ROLE_ID)) { // Moderator role
			helpEmbed.addFields([
				{ name: 'Moderator Commands', value: modCommandsList },
				{ name: 'Helper Commands', value: helperCommandsList },
				{ name: '@everyone Commands', value: everyoneCommandsList }
			])
		} else if(interaction.member.roles.cache.has(process.env.HELPER_ROLE_ID)) { // Helper role
			helpEmbed.addFields([
				{ name: 'Helper Commands', value: helperCommandsList },
				{ name: '@everyone Commands', value: everyoneCommandsList }
			])
		} else { // @everyone
			helpEmbed.setDescription(everyoneCommandsList)
		}
		
		interaction.reply({ embeds: [helpEmbed] })
	},
}