const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pause')
		.setDescription('Pause the currently playing song'),
		
	async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel

        if(voiceChannel) {
            const queue = interaction.client.DisTube.getQueue(interaction.guild)

            if(!queue) {
                const errEmbed = new EmbedBuilder()
                    .setDescription(`The queue is empty`)
                    .setColor('0xdf0000')
                return interaction.reply({ embeds: [errEmbed] })
            }

            if(queue.paused) {
                queue.resume()
                const pauseEmbed = new EmbedBuilder()
                    .setDescription(`Resumed the song`)
                    .setColor(process.env.MUSIC_COLOR)
                return interaction.reply({ embeds: [pauseEmbed] })
            }
            
            queue.pause()
            const pauseEmbed = new EmbedBuilder()
                .setDescription(`Paused the song`)
                .setColor(process.env.MUSIC_COLOR)
            return interaction.reply({ embeds: [pauseEmbed] })

        } else {
            const errEmbed = new EmbedBuilder()
                .setDescription(`You must join a voice channel!`)
                .setColor('0xdf0000')
            return interaction.reply({ embeds: [errEmbed] })
        }
	},
}