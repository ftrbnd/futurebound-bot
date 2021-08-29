const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('serverinfo')
		.setDescription(`Get basic info about this server`),
		
	async execute(interaction) {
        const createdAt = interaction.guild.createdAt.toString().split(' ')

        const serverInfo = new MessageEmbed()
            .setTitle(`***${interaction.guild}*** server info`)
            .setDescription(interaction.guild.description)
            .setThumbnail(interaction.guild.iconURL({ dynamic : true}))
            .setColor(0xf03200)
            .addFields(
                {
                    name: 'Owner',
                    value: `<@${interaction.guild.ownerId}>`,
                    inline: true,
                },
                {
                    name: 'Date Created',
                    value: `${createdAt[1]} ${createdAt[2]} ${createdAt[3]}`,
                    inline: true,
                },
                {
                    name: 'Member Count',
                    value: `${interaction.guild.memberCount}`,
                    inline: true,
                },
                {
                    name: 'Server Level',
                    value: `${interaction.guild.premiumTier}`.slice(5), // remove 'TIER_' from 'TIER_#'
                    inline: true,
                }, 
                {
                    name: 'Server Boosts',
                    value: `${interaction.guild.premiumSubscriptionCount}`,
                    inline: true,
                },     
            )

		interaction.reply({ embeds: [serverInfo] })
	},
}