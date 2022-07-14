require('dotenv').config()

const { SlashCommandBuilder } = require('@discordjs/builders')
const { PermissionFlagsBits } = require('discord-api-types/v9')
const { MessageEmbed } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lockdown')
		.setDescription('In the event of large amounts of spam')
        .addSubcommand(subcommand =>
            subcommand
                .setName('close')
                .setDescription('Close all text channels'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('open')
                .setDescription('Re-open all text channels')),
		
	async execute(interaction) {
        if(interaction.member.roles.cache.has(process.env.MODERATORS_ROLE_ID) || interaction.member.roles.cache.has(process.env.HELPER_ROLE_ID)) { // Moderator and Helper roles
            
            const roles = [
                interaction.guild.roles.cache.get('704966097434312766'), // server boosters
                interaction.guild.roles.cache.get('702225844113899591'), // no future
                interaction.guild.roles.cache.get('702225672147566642'), // vertigo
                interaction.guild.roles.cache.get('702226305164509185'), // ityttmom
                interaction.guild.roles.cache.get('702226350324318299'), // End Credits
                interaction.guild.roles.cache.get('655655072885374987')] // @everyone

            if(interaction.options.getSubcommand() === 'close') { // Close all text channels

                const removedPermissions = [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.CreateInstantInvite, PermissionFlagsBits.ChangeNickname, PermissionFlagsBits.AddReactions, PermissionFlagsBits.UseExternalEmojis, PermissionFlagsBits.UseExternalStickers, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak, PermissionFlagsBits.Stream, PermissionFlagsBits.UseVAD, PermissionFlagsBits.RequestToSpeak]

                roles.forEach(role => role.setPermissions(removedPermissions))

                const confirmEmbed = new MessageEmbed()
                    .setDescription(`**${interaction.guild.name}** is now on lockdown.`)
                    .setColor(0xdf0000)
                return interaction.reply({ embeds: [confirmEmbed], ephemeral: false })

            } else if(interaction.options.getSubcommand() === 'open') { // Open all text channels
                
                const defaultPermissions = [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.CreateInstantInvite, PermissionFlagsBits.ChangeNickname, PermissionFlagsBits.SendMessages, PermissionFlagsBits.UsePublicThreads, PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.AttachFiles, PermissionFlagsBits.AddReactions, PermissionFlagsBits.UseExternalEmojis, PermissionFlagsBits.UseExternalStickers, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.UseSlashCommands, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak, PermissionFlagsBits.Stream, PermissionFlagsBits.UseVAD, PermissionFlagsBits.RequestToSpeak]

                roles.forEach(role => role.setPermissions(defaultPermissions))

                const confirmEmbed = new MessageEmbed()
                    .setDescription(`**${interaction.guild.name}** is now open!`)
                    .setColor(0x32ff25)
                return interaction.reply({ embeds: [confirmEmbed], ephemeral: false })

            }
        } else {
            const permsEmbed = new MessageEmbed()
                .setDescription('You do not have permission to use this command.')
                .setColor(0xdf0000)
            return interaction.reply({ embeds: [permsEmbed], ephemeral: true })
        }
	},
}