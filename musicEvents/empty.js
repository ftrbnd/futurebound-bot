require('dotenv').config()

const { EmbedBuilder } = require('discord.js')

module.exports = {
	name: 'empty',
	async execute(queue) {
        const emptyEmbed = new EmbedBuilder()
            .setDescription(`**${queue.voiceChannel.name}** is empty - disconnecting...`)
            .setColor(process.env.MUSIC_COLOR)

        queue.textChannel.send({ embeds: [emptyEmbed] })
	},
}