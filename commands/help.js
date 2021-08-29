const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Get a list of the commands for this bot'),
		
	async execute(interaction) {
		const helpEmbed = new MessageEmbed()
			.setTitle(`***${interaction.guild}*** commands list`)
			.setThumbnail(interaction.guild.iconURL({ dynamic : true}))
			.setColor(0xf03200)
			.addFields(
				{
					name: 'Prefix',
					value: process.env.PREFIX,
					inline: true,
				},
				{
					name: 'Moderator Commands',
					value: 'ban, clear, kick, listeningparty, listeningpartyopen, lockdown, mute, react, reopen, say, slowmode, survivor, unmute, warn',
					inline: false,
				},
				{
					name: 'General Commands',
					value: '8ball, eden, lyrics, serverinfo, typingtest, urban',
					inline: false,
				},  
			);

		interaction.reply({ embeds: [helpEmbed] })
	},
}