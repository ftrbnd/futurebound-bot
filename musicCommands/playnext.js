const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('playnext')
		.setDescription('Add your song to the top of the queue')
        .addStringOption(option => 
            option.setName('song')
            .setDescription('Search query or YouTube link')
            .setRequired(true)),
		
	async execute(interaction) {
        const getAllowedRoleId = require('../helperFunctions/getAllowedRoleId');
        const allowedRoleId = await getAllowedRoleId.execute(interaction);

        if (interaction.member._roles.includes(allowedRoleId) || allowedRoleId == interaction.guild.roles.everyone.id) {
            const chosenSong = interaction.options.getString('song')
            const voiceChannel = interaction.member.voice.channel

            if(voiceChannel) {
                await interaction.client.DisTube.play(interaction.member.voice.channel, chosenSong, {
                    member: interaction.member,
                    textChannel: interaction.channel,
                    position: 1
                }).catch(err => {
                    console.log(err)
                    const errEmbed = new EmbedBuilder()
                        .setDescription(`An error occurred in /playskip.`)
                        .setColor('0xdf0000')
                    return interaction.reply({ embeds: [errEmbed]})
                })
        
                const playEmbed = new EmbedBuilder()
                    .setDescription(`Your entry: **${chosenSong}**`)
        
                interaction.reply({ embeds: [playEmbed], ephemeral: true })

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