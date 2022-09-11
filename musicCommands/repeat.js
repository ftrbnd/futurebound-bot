const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('repeat')
		.setDescription('Repeat the current song, queue, or turn repeat off')
        .addIntegerOption(option => 
            option.setName('mode')
            .setDescription('The repeat mode')
            .setRequired(true)
            .addChoices(
                { name: 'Off', value: 0 },
                { name: 'Song', value: 1 },
                { name: 'Queue', value: 2 },
            )),
		
	async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel

        if(voiceChannel) {
            const queue = interaction.client.DisTube.getQueue(interaction.guild)
            var mode = interaction.options.getInteger('mode')

            if(!queue) {
                const errEmbed = new EmbedBuilder()
                    .setDescription(`The queue is empty`)
                    .setColor('0xdf0000')
                return interaction.reply({ embeds: [errEmbed] })
            }

            mode = queue.setRepeatMode(mode)

            let repeatMode = ''
            switch(mode) {
                case 0:
                    repeatMode = 'Off'
                    break
                case 1:
                    repeatMode = 'Song'
                    break
                case 2:
                    repeatMode = 'Queue'
                    break
            }

            const repeatEmbed = new EmbedBuilder()
                .setDescription(`Set repeat mode to **${repeatMode}**`)
                .setColor(process.env.MUSIC_COLOR)
            
            interaction.reply({ embeds: [repeatEmbed] })

        } else {
            const errEmbed = new EmbedBuilder()
                .setDescription(`You aren't in a voice channel`)
                .setColor('0xdf0000')
            return interaction.reply({ embeds: [errEmbed] })
        }
	},
}