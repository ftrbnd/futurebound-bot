const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed, Permissions } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('listeningparty')
		.setDescription('Open a listening party chat and stage channel')
        .addStringOption(option => 
            option.setName('name')
            .setDescription('The name of the listening party')
            .setRequired(true)),

	async execute(interaction) {
		if(interaction.member.roles.cache.has('691882703674540042')) { // Moderator role
            const listeningPartyName = interaction.options._hoistedOptions[0].value

            const categoryChannel = await interaction.guild.channels.create('Listening Party', {
                type: 'GUILD_CATEGORY',
                position: 2,
                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone.id, 
                        deny: [Permissions.FLAGS.VIEW_CHANNEL]
                    },
                    {
                        id: interaction.client.user.id, // this bot itself
                        allow: [Permissions.FLAGS.VIEW_CHANNEL]
                    }
                ]
            })

            const listeningPartyChat = await interaction.guild.channels.create('listening party chat', {
                type: 'GUILD_TEXT',
                parent: categoryChannel,
                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone.id, 
                        deny: [Permissions.FLAGS.VIEW_CHANNEL]
                    },
                    {
                        id: interaction.guild.roles.cache.find(role => role.name === 'Bot').id, // all other bots
                        deny: [Permissions.FLAGS.VIEW_CHANNEL]
                    },
                    {
                        id: interaction.client.user.id, // this bot itself
                        allow: [Permissions.FLAGS.VIEW_CHANNEL]
                    }
                ]
            })

            const stageChannel = await interaction.guild.channels.create(listeningPartyName, {
                type: 'GUILD_STAGE_VOICE',
                parent: categoryChannel,
                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone.id,
                        deny: [Permissions.FLAGS.VIEW_CHANNEL]
                    },
                    {
                        id: interaction.client.user.id, // this bot itself
                        allow: [Permissions.FLAGS.VIEW_CHANNEL]
                    }
                ]
            })

            const confirmEmbed = new MessageEmbed()
                .setDescription(`**${listeningPartyName}** channels have been created!`)
                .setColor(0x32ff25)
            return interaction.reply({ embeds: [confirmEmbed] })

            } else {
            const permsEmbed = new MessageEmbed()
                .setDescription('You do not have permission to use this command.')
                .setColor(0xdf0000)
            return interaction.reply({ embeds: [permsEmbed], ephemeral: true })
        }
	},
}