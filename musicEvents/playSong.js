require('dotenv').config()

const { EmbedBuilder } = require('discord.js')

module.exports = {
	name: 'playSong',
	async execute(queue, song) {
        const playEmbed = new EmbedBuilder()
            .setDescription(`Now playing [${song.name}](${song.url}) [${song.user}]`)
            .setColor(process.env.MUSIC_COLOR)

        queue.textChannel.send({ embeds: [playEmbed] })
	},
}