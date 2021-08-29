const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed, Permissions } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('listeningparty')
		.setDescription('Open a listening party chat and stage channel')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create the listening party channels')
                .addStringOption(option => 
                    option.setName('name')
                    .setDescription('The name of the listening party')
                    .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('open')
                .setDescription('Make the channels public'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('close')
                .setDescription('Make the channels private')),

	async execute(interaction) {
		if(interaction.member.roles.cache.has('691882703674540042')) { // Moderator role
            if(interaction.options.getSubcommand() === 'create') {
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

            } else if(interaction.options.getSubcommand() === 'open') {
                var categoryChannel = interaction.guild.channels.cache.find(channel => channel.name === 'Listening Party')
                categoryChannel.edit(
                    {
                        permissionOverwrites: [
                            {
                                id: interaction.guild.roles.everyone.id, 
                                allow: [Permissions.FLAGS.VIEW_CHANNEL]
                            }
                        ]
                    }
                )

                var listeningPartyChat = interaction.guild.channels.cache.find(channel => channel.name === 'listening-party-chat')
                listeningPartyChat.edit(
                    {
                        permissionOverwrites: [
                            {
                                id: interaction.guild.roles.everyone.id, 
                                allow: [Permissions.FLAGS.VIEW_CHANNEL]
                            },
                            {
                                id: interaction.guild.roles.cache.find(role => role.name === 'Bot').id,
                                deny: [Permissions.FLAGS.VIEW_CHANNEL]
                            },
                            {
                                id: interaction.client.user.id, // this bot itself
                                allow: [Permissions.FLAGS.VIEW_CHANNEL]
                            }
                        ]
                    }
                )

                var stageChannel = interaction.guild.channels.cache.find(channel => channel.type === 'GUILD_STAGE_VOICE')
                stageChannel.edit(
                    {
                        permissionOverwrites: [
                            {
                                id: interaction.guild.roles.everyone.id, 
                                allow: [Permissions.FLAGS.VIEW_CHANNEL]
                            },
                            {
                                id: interaction.client.user.id, // this bot itself
                                allow: [Permissions.FLAGS.VIEW_CHANNEL]
                            }
                        ]
                    }
                )
                stageChannel.setTopic(`Listening to ${stageChannel.name}!`)

                const confirmEmbed = new MessageEmbed()
                    .setDescription(`**${stageChannel.name}** channels have been opened to everyone!`)
                    .setColor(0x32ff25)
                interaction.reply(({ embeds: [confirmEmbed] }))

            } else if(interaction.options.getSubcommand() === 'close') {
                var categoryChannel = interaction.guild.channels.cache.find(channel => channel.name === 'Listening Party')
                categoryChannel.edit(
                    {
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
                    }
                )

                var listeningPartyChat = interaction.guild.channels.cache.find(channel => channel.name === 'listening-party-chat')
                listeningPartyChat.edit(
                    {
                        permissionOverwrites: [
                            {
                                id: interaction.guild.roles.everyone.id, 
                                deny: [Permissions.FLAGS.VIEW_CHANNEL]
                            },
                            {
                                id: interaction.guild.roles.cache.find(role => role.name === 'Bot').id,
                                deny: [Permissions.FLAGS.VIEW_CHANNEL]
                            },
                            {
                                id: interaction.client.user.id, // this bot itself
                                allow: [Permissions.FLAGS.VIEW_CHANNEL]
                            }
                        ]
                    }
                )

                var stageChannel = interaction.guild.channels.cache.find(channel => channel.type === 'GUILD_STAGE_VOICE')
                stageChannel.edit(
                    {
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
                    }
                )

                const confirmEmbed = new MessageEmbed()
                    .setDescription(`**${stageChannel.name}** channels have been closed.`)
                    .setColor(0x32ff25)
                interaction.reply(({ embeds: [confirmEmbed] }))

            }
        } else {
        const permsEmbed = new MessageEmbed()
            .setDescription('You do not have permission to use this command.')
            .setColor(0xdf0000)
        return interaction.reply({ embeds: [permsEmbed], ephemeral: true })
        }
	},
}