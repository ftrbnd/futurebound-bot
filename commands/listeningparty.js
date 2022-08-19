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
                .setName('preview')
                .setDescription('Everyone can view the channels but are unable to chat/join'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('open')
                .setDescription('Allow everyone to chat and join'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('close')
                .setDescription('Make the channels private'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('archive')
                .setDescription('Delete the Stage channel and move the text channel to the Archived category'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),  // only the Server Moderator role can use this command

	async execute(interaction) {
		if(interaction.member.roles.cache.has(process.env.MODERATORS_ROLE_ID)) { // Moderator role
            if(interaction.options.getSubcommand() === 'create') {
                const listeningPartyName = interaction.options._hoistedOptions[0].value

                const categoryChannel = await interaction.guild.channels.create({
                    name: 'Listening Party',
                    type: ChannelType.GuildCategory,
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

                const listeningPartyChat = await categoryChannel.children.create({
                    name: 'listening party chat',
                    type: ChannelType.GuildText,
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

                const stageChannel = await categoryChannel.children.create({
                    name: listeningPartyName,
                    type: ChannelType.GuildStageVoice,
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

            } else if(interaction.options.getSubcommand() === 'preview') {
                var categoryChannel = await interaction.guild.channels.cache.find(channel => channel.name === 'Listening Party')
                categoryChannel.edit({
                    permissionOverwrites: [
                        {
                            id: interaction.guild.roles.everyone.id, 
                            allow: [PermissionFlagsBits.ViewChannel]
                        }
                    ]
                })

                var listeningPartyChat = await categoryChannel.children.cache.find(channel => channel.name === 'listening-party-chat')
                listeningPartyChat.edit({
                    permissionOverwrites: [
                        {
                            id: interaction.guild.roles.everyone.id, 
                            allow: [PermissionFlagsBits.ViewChannel],
                            deny: [PermissionFlagsBits.SendMessages]
                        },
                        {
                            id: interaction.guild.roles.cache.find(role => role.name === 'Bot').id,
                            deny: [PermissionFlagsBits.ViewChannel]
                        },
                        {
                            id: interaction.client.user.id, // this bot itself
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                        }
                    ]
                })

                var stageChannel = await categoryChannel.children.cache.find(channel => channel.type === ChannelType.GuildStageVoice)
                stageChannel.edit({
                    permissionOverwrites: [
                        {
                            id: interaction.guild.roles.everyone.id, 
                            allow: [PermissionFlagsBits.ViewChannel],
                            deny: [PermissionFlagsBits.Connect]
                        },
                        {
                            id: interaction.client.user.id, // this bot itself
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]
                        }
                    ]
                })
                stageChannel.setTopic(`Listening to ${stageChannel.name}!`)

                const confirmEmbed = new EmbedBuilder()
                    .setDescription(`**${stageChannel.name}** channels are now public but locked.`)
                    .setColor('0x32ff25')
                interaction.reply(({ embeds: [confirmEmbed] }))


            } else if(interaction.options.getSubcommand() === 'open') {
                var categoryChannel = await interaction.guild.channels.cache.find(channel => channel.name === 'Listening Party')
                categoryChannel.edit({
                    permissionOverwrites: [
                        {
                            id: interaction.guild.roles.everyone.id, 
                            allow: [PermissionFlagsBits.ViewChannel]
                        }
                    ]
                })

                var listeningPartyChat = await categoryChannel.children.cache.find(channel => channel.name === 'listening-party-chat')
                listeningPartyChat.edit({
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
                })

                var stageChannel = await categoryChannel.children.cache.find(channel => channel.type === ChannelType.GuildStageVoice)
                stageChannel.edit({
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
                })
                stageChannel.setTopic(`Listening to ${stageChannel.name}!`)

                const confirmEmbed = new EmbedBuilder()
                    .setDescription(`**${stageChannel.name}** channels have been opened to everyone!`)
                    .setColor('0x32ff25')
                interaction.reply(({ embeds: [confirmEmbed] }))

            } else if(interaction.options.getSubcommand() === 'close') {
                var categoryChannel = await interaction.guild.channels.cache.find(channel => channel.name === 'Listening Party')
                categoryChannel.edit({
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

                var listeningPartyChat = await categoryChannel.children.cache.find(channel => channel.name === 'listening-party-chat')
                listeningPartyChat.edit({
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
                })

                var stageChannel = await categoryChannel.children.cache.find(channel => channel.type === ChannelType.GuildStageVoice)
                stageChannel.edit({
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
                    .setDescription(`**${stageChannel.name}** channels have been closed.`)
                    .setColor('0x32ff25')
                interaction.reply(({ embeds: [confirmEmbed] }))

            } else if(interaction.options.getSubcommand() === 'archive') {
                var categoryChannel = await interaction.guild.channels.cache.find(channel => channel.name === 'Listening Party')
                var listeningPartyChat = await categoryChannel.children.cache.find(channel => channel.name === 'listening-party-chat')
                var stageChannel = await categoryChannel.children.cache.find(channel => channel.type === ChannelType.GuildStageVoice)
                var archivesChannel = await interaction.guild.channels.cache.find(channel => channel.name === 'archived')
                
                await listeningPartyChat.edit({
                    parent: archivesChannel
                })

                await stageChannel.delete()
                await categoryChannel.delete()

                const confirmEmbed = new EmbedBuilder()
                    .setDescription(`**${listeningPartyChat.name}** has been archived.`)
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