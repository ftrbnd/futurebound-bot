const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('View the current queue'),
		
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

            const queueList = queue.songs.map((song, id) => 
                `${id+1}) [${song.name}](${song.url}) - \`${song.formattedDuration}\``
            ).join('\n')

            const queueEmbed = new EmbedBuilder()
                .setDescription(queueList)
                .setColor(process.env.MUSIC_COLOR)
    
            interaction.reply({ embeds: [queueEmbed] })

        } else {
            const errEmbed = new EmbedBuilder()
                .setDescription(`You must join a voice channel!`)
                .setColor('0xdf0000')
            return interaction.reply({ embeds: [errEmbed] })
        }
	},
}