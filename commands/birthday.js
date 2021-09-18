const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('birthday')
		.setDescription('Set your birthday!')
        .addStringOption(option => 
            option.setName('date')
            .setDescription(`The date you were born (YYYY-MM-DD)`)
            .setRequired(true))
        .addStringOption(option => 
            option.setName('timezone')
            .setDescription(`The abbreviation of your timezone (PST, EST, GMT, etc.)`)
            .setRequired(true)),
		
	async execute(interaction) {

		interaction.reply({ content: 'happy birthday' })
	},
}