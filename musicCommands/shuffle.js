const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('shuffle')
		.setDescription('Shuffle the queue'),
		
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

                queue.shuffle()

                const shuffleEmbed = new EmbedBuilder()
                    .setDescription('Shuffled the queue')
                    .setColor(process.env.MUSIC_COLOR)
        
                interaction.reply({ embeds: [shuffleEmbed] })

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