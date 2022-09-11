const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('Stop the music and delete the queue'),
		
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

            queue.stop()

            const stopEmbed = new EmbedBuilder()
                .setDescription('Stopped the queue')
                .setColor(process.env.MUSIC_COLOR)
    
            interaction.reply({ embeds: [stopEmbed] })

        } else {
            const errEmbed = new EmbedBuilder()
                .setDescription(`You must join a voice channel!`)
                .setColor('0xdf0000')
            return interaction.reply({ embeds: [errEmbed] })
        }
	},
}