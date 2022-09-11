const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('join')
		.setDescription('Get the bot to join your voice channel'),
		
	async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel

        if(voiceChannel) {
            interaction.client.DisTube.voices.join(voiceChannel)

            const joinEmbed = new EmbedBuilder()
                .setDescription(`Joined **${voiceChannel.name}**`)
                .setColor(process.env.MUSIC_COLOR)
    
            interaction.reply({ embeds: [joinEmbed] })

        } else {
            const errEmbed = new EmbedBuilder()
                .setDescription(`You must join a voice channel!`)
                .setColor('0xdf0000')
            return interaction.reply({ embeds: [errEmbed] })
        }
	},
}