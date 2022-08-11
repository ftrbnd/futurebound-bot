const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('serverinfo')
		.setDescription(`Get basic info about this server`),
		
	async execute(interaction) {
        const createdAt = interaction.guild.createdAt.toString().split(' ')

        const serverInfo = new EmbedBuilder()
            .setTitle(`***${interaction.guild}*** server info`)
            .setDescription(`${interaction.guild.description}`)
            .setThumbnail(interaction.guild.iconURL({ dynamic : true}))
            .setColor('0xf03200')
            .addFields(
                {
                    name: 'Owner',
                    value: `<@${interaction.guild.ownerId}>`,
                },
                {
                    name: 'Date Created',
                    value: `${createdAt[1]} ${createdAt[2]} ${createdAt[3]}`,
                },
                {
                    name: 'Member Count',
                    value: `${interaction.guild.memberCount}`,
                },
                {
                    name: 'Server Level',
                    value: `${interaction.guild.premiumTier}`.slice(5), // remove 'TIER_' from 'TIER_#'
                }, 
                {
                    name: 'Server Boosts',
                    value: `${interaction.guild.premiumSubscriptionCount}`,
                },     
            )

		interaction.reply({ embeds: [serverInfo] })
	},
}