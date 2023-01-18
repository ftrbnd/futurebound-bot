const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leave')
		.setDescription('Leave your voice channel'),
		
	async execute(interaction) {
        const getAllowedRoleId = require('../helperFunctions/getAllowedRoleId');
        const allowedRoleId = await getAllowedRoleId.execute(interaction);

        if (interaction.member._roles.includes(allowedRoleId) || allowedRoleId == interaction.guild.roles.everyone.id) {
            const voiceChannel = interaction.client.DisTube.voices.get(interaction.member.voice.channel)

            if(voiceChannel) {
                voiceChannel.leave()

                const leaveEmbed = new EmbedBuilder()
                    .setDescription(`Left **${interaction.member.voice.channel.name}**`)
                    .setColor(process.env.MUSIC_COLOR)
        
                interaction.reply({ embeds: [leaveEmbed] })

            } else {
                const errEmbed = new EmbedBuilder()
                    .setDescription(`Not in a voice channel`)
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