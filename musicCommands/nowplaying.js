const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nowplaying')
		.setDescription('See what song is currently playing'),
		
	async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel

        if(voiceChannel) {
            const queue = interaction.client.DisTube.getQueue(interaction.guild)

            if(!queue) {
                const errEmbed = new EmbedBuilder()
                    .setDescription(`There is nothing playing`)
                    .setColor('0xdf0000')
                return interaction.reply({ embeds: [errEmbed] })
            }

            const npEmbed = new EmbedBuilder()
                .setDescription(`Now playing [${queue.songs[0].name}](${queue.songs[0].url}) [${queue.songs[0].user}]`)
                .setColor(process.env.MUSIC_COLOR)
    
            interaction.reply({ embeds: [npEmbed] })

        } else {
            const errEmbed = new EmbedBuilder()
                .setDescription(`You aren't in a voice channel`)
                .setColor('0xdf0000')
            return interaction.reply({ embeds: [errEmbed] })
        }
	},
}