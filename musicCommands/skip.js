const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skip the current song in the queue'),
		
	async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel

        if(voiceChannel) {
            const queue = interaction.client.DisTube.getQueue(interaction.guild)

            if(!queue) {
                const errEmbed = new EmbedBuilder()
                    .setDescription(`The queue is empty!`)
                    .setColor('0xdf0000')
                return interaction.reply({ embeds: [errEmbed] })
            }

            try {
                const song = await queue.skip()

                const queueEmbed = new EmbedBuilder()
                    .setDescription(`Skipped to **${song.name}**`)
                    .setColor(process.env.MUSIC_COLOR)
        
                interaction.reply({ embeds: [queueEmbed] })

            } catch(error) {
                console.log(error)
                const errEmbed = new EmbedBuilder()
                    .setDescription(`An error occurred in /skip.`)
                    .setColor('0xdf0000')
                return interaction.reply({ embeds: [errEmbed] })
            }

        } else {
            const errEmbed = new EmbedBuilder()
                .setDescription(`You must join a voice channel!`)
                .setColor('0xdf0000')
            return interaction.reply({ embeds: [errEmbed] })
        }
	},
}