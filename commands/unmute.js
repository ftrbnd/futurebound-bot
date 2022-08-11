require('dotenv').config()

const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unmute')
		.setDescription('Unmute a user by removing their unmuted role')
        .addUserOption(option =>
            option.setName('user')
            .setDescription('The user to be ununmuted')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles), // any permission that the Helper role has access to should work
		
	async execute(interaction) {
        if(interaction.member.roles.cache.has(process.env.MODERATORS_ROLE_ID) || interaction.member.roles.cache.has(process.env.HELPER_ROLE_ID)) { // Moderator and Helper roles
            const userToUnmute = interaction.options._hoistedOptions[0].user

            const modChannel = interaction.guild.channels.cache.get(process.env.MODERATORS_CHANNEL_ID)
            if(!modChannel) return

            const logEmbed = new EmbedBuilder()
                .setTitle(userToUnmute.tag + ' was unmuted.')
                .addFields([
                    { name: 'User ID: ', value: `${userToUnmute.id}`},
                    { name: 'By: ', value: `${interaction.user}`},
                ])
                .setColor('0x32ff25')
                .setThumbnail(userToUnmute.displayAvatarURL({ dynamic : true }))
                .setFooter({
                    text: interaction.guild.name, 
                    iconURL: interaction.guild.iconURL({ dynamic : true })
                })
                .setTimestamp()
            modChannel.send({ embeds: [logEmbed] })

            const unmuteEmbed = new EmbedBuilder()
                .setTitle(`You were unmuted in **${interaction.guild.name}**.`)
                .setColor('0x32ff25')
                .setFooter({
                    text: interaction.guild.name, 
                    iconURL: interaction.guild.iconURL({ dynamic : true })
                })
                .setTimestamp()
            
            try {
                await userToUnmute.send({ embeds: [unmuteEmbed] })
            } catch(err) {
                console.log(err)
            }
            
            userToUnmuteMember = interaction.guild.members.cache.get(`${userToUnmute.id}`)
            userToUnmuteMember.roles.set([])

            const unmutedEmbed = new EmbedBuilder()
                .setDescription(`${userToUnmute} was unmuted.`)
                .setColor('0x32ff25')
            interaction.reply({ embeds: [unmutedEmbed] })
        } else {
            const permsEmbed = new EmbedBuilder()
                .setDescription('You do not have permission to use this command.')
                .setColor('0xdf0000')
            return interaction.reply({ embeds: [permsEmbed], ephemeral: true })
        }
	},
}