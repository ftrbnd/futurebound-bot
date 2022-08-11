require('dotenv').config()

const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, ChannelType } = require('discord.js')

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
                .setDescription('Make the channels private'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),  // only the Server Moderator role can use this command

	async execute(interaction) {
		if(interaction.member.roles.cache.has(process.env.MODERATORS_ROLE_ID)) { // Moderator role
            if(interaction.options.getSubcommand() === 'create') {
                const listeningPartyName = interaction.options._hoistedOptions[0].value

                const categoryChannel = await interaction.guild.channels.create({
                    name: 'Listening Party',
                    type: 'GUILD_CATEGORY',
                    position: 2,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.roles.everyone.id, 
                            deny: [PermissionFlagsBits.ViewChannel]
                        },
                        {
                            id: interaction.client.user.id, // this bot itself
                            allow: [PermissionFlagsBits.ViewChannel]
                        }
                    ]
                })

                const listeningPartyChat = await interaction.guild.channels.create({
                    name: 'listening party chat',
                    type: 'GUILD_TEXT',
                    parent: categoryChannel,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.roles.everyone.id, 
                            deny: [PermissionFlagsBits.ViewChannel]
                        },
                        {
                            id: interaction.guild.roles.cache.find(role => role.name === 'Bot').id, // all other bots
                            deny: [PermissionFlagsBits.ViewChannel]
                        },
                        {
                            id: interaction.client.user.id, // this bot itself
                            allow: [PermissionFlagsBits.ViewChannel]
                        }
                    ]
                })

                const stageChannel = await interaction.guild.channels.create({
                    name: listeningPartyName,
                    type: 'GUILD_STAGE_VOICE',
                    parent: categoryChannel,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.roles.everyone.id,
                            deny: [PermissionFlagsBits.ViewChannel]
                        },
                        {
                            id: interaction.client.user.id, // this bot itself
                            allow: [PermissionFlagsBits.ViewChannel]
                        }
                    ]
                })

                const confirmEmbed = new EmbedBuilder()
                    .setDescription(`**${listeningPartyName}** channels have been created!`)
                    .setColor('0x32ff25')
                return interaction.reply({ embeds: [confirmEmbed] })

            } else if(interaction.options.getSubcommand() === 'open') {
                var categoryChannel = interaction.guild.channels.cache.find(channel => channel.name === 'Listening Party')
                categoryChannel.edit(
                    {
                        permissionOverwrites: [
                            {
                                id: interaction.guild.roles.everyone.id, 
                                allow: [PermissionFlagsBits.ViewChannel]
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
                                allow: [PermissionFlagsBits.ViewChannel]
                            },
                            {
                                id: interaction.guild.roles.cache.find(role => role.name === 'Bot').id,
                                deny: [PermissionFlagsBits.ViewChannel]
                            },
                            {
                                id: interaction.client.user.id, // this bot itself
                                allow: [PermissionFlagsBits.ViewChannel]
                            }
                        ]
                    }
                )

                var stageChannel = interaction.guild.channels.cache.find(channel => channel.type === ChannelType.GuildStageVoice)
                stageChannel.edit(
                    {
                        permissionOverwrites: [
                            {
                                id: interaction.guild.roles.everyone.id, 
                                allow: [PermissionFlagsBits.ViewChannel]
                            },
                            {
                                id: interaction.client.user.id, // this bot itself
                                allow: [PermissionFlagsBits.ViewChannel]
                            }
                        ]
                    }
                )
                stageChannel.setTopic(`Listening to ${stageChannel.name}!`)

                const confirmEmbed = new EmbedBuilder()
                    .setDescription(`**${stageChannel.name}** channels have been opened to everyone!`)
                    .setColor('0x32ff25')
                interaction.reply(({ embeds: [confirmEmbed] }))

            } else if(interaction.options.getSubcommand() === 'close') {
                var categoryChannel = interaction.guild.channels.cache.find(channel => channel.name === 'Listening Party')
                categoryChannel.edit(
                    {
                        permissionOverwrites: [
                            {
                                id: interaction.guild.roles.everyone.id, 
                                deny: [PermissionFlagsBits.ViewChannel]
                            },
                            {
                                id: interaction.client.user.id, // this bot itself
                                allow: [PermissionFlagsBits.ViewChannel]
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
                                deny: [PermissionFlagsBits.ViewChannel]
                            },
                            {
                                id: interaction.guild.roles.cache.find(role => role.name === 'Bot').id,
                                deny: [PermissionFlagsBits.ViewChannel]
                            },
                            {
                                id: interaction.client.user.id, // this bot itself
                                allow: [PermissionFlagsBits.ViewChannel]
                            }
                        ]
                    }
                )

                var stageChannel = interaction.guild.channels.cache.find(channel => channel.type === ChannelType.GuildStageVoice)
                stageChannel.edit(
                    {
                        permissionOverwrites: [
                            {
                                id: interaction.guild.roles.everyone.id, 
                                deny: [PermissionFlagsBits.ViewChannel]
                            },
                            {
                                id: interaction.client.user.id, // this bot itself
                                allow: [PermissionFlagsBits.ViewChannel]
                            }
                        ]
                    }
                )

                const confirmEmbed = new EmbedBuilder()
                    .setDescription(`**${stageChannel.name}** channels have been closed.`)
                    .setColor('0x32ff25')
                interaction.reply(({ embeds: [confirmEmbed] }))

            }
        } else {
        const permsEmbed = new EmbedBuilder()
            .setDescription('You do not have permission to use this command.')
            .setColor('0xdf0000')
        return interaction.reply({ embeds: [permsEmbed], ephemeral: true })
        }
	},
}