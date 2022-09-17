require('dotenv').config()

const { EmbedBuilder } = require('discord.js')

module.exports = {
	name: 'error',
	async execute(channel, error) {
        console.log(error)
        
        const errEmbed = new EmbedBuilder()
            .setDescription(`An error occurred.`)
            .setColor('0xdf0000')

        channel.send({ embeds: [errEmbed]})
	},
}