const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('View the current queue'),
		
	async execute(interaction) {
        const getAllowedRoleId = require('../helperFunctions/getAllowedRoleId');
        const allowedRoleId = await getAllowedRoleId.execute(interaction);

        if (interaction.member._roles.includes(allowedRoleId) || allowedRoleId == interaction.guild.roles.everyone.id) {
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

                let repeatMode = ''
                switch(queue.repeatMode) {
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

                const queueEmbed = new EmbedBuilder()
                    .setDescription(queueList)
                    .setColor(process.env.MUSIC_COLOR)
                    .setFooter({
                        text: `Repeat mode: ${repeatMode}`
                    })
        
                interaction.reply({ embeds: [queueEmbed] })

            } else {
                const errEmbed = new EmbedBuilder()
                    .setDescription(`You must join a voice channel!`)
                    .setColor('0xdf0000')
                return interaction.reply({ embeds: [errEmbed] })
            }
        } else {
            const errEmbed = new EmbedBuilder()
                .setDescription(`You do not have permission to use music commands right now!`)
                .setColor('0xdf0000')
            interaction.reply({ embeds: [errEmbed] })
        }
	},
}