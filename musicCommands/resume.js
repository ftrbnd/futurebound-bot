const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('resume')
		.setDescription('Resume playing the song'),
		
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

                if(queue.paused) {
                    queue.resume()
                    const pauseEmbed = new EmbedBuilder()
                        .setDescription(`Resumed the song`)
                        .setColor(process.env.MUSIC_COLOR)
                    return interaction.reply({ embeds: [pauseEmbed] })

                } else {
                    const errEmbed = new EmbedBuilder()
                        .setDescription(`The song is not paused!`)
                        .setColor('0xdf0000')
                    return interaction.reply({ embeds: [errEmbed] })
                }
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