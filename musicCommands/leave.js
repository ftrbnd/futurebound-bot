const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leave')
		.setDescription('Leave your voice channel'),
		
	async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel

        if(voiceChannel) {
            interaction.client.DisTube.voices.get(voiceChannel).leave()

            const leaveEmbed = new EmbedBuilder()
                .setDescription(`Left **${voiceChannel.name}**`)
                .setColor(process.env.MUSIC_COLOR)
    
            interaction.reply({ embeds: [leaveEmbed] })

        } else {
            const errEmbed = new EmbedBuilder()
                .setDescription(`You aren't in a voice channel`)
                .setColor('0xdf0000')
            return interaction.reply({ embeds: [errEmbed] })
        }
	},
}