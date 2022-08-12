require('dotenv').config()

const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('timeout')
		.setDescription('Timeout a user for a specified amount of time')
        .addUserOption(option =>
            option.setName('user')
            .setDescription('The user to be timed out')
            .setRequired(true))
        .addIntegerOption(option => 
            option.setName('minutes')
            .setDescription('Amount of minutes to timeout')
            .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
            .setDescription('The reason for timeout')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles), // any permission that the Helper role has access to should work
		
	async execute(interaction) {
        if(interaction.member.roles.cache.has(process.env.MODERATORS_ROLE_ID) || interaction.member.roles.cache.has(process.env.HELPER_ROLE_ID)) { // Moderator and Helper roles
            console.log(interaction.options._hoistedOptions)
            var userToTimeout = interaction.options._hoistedOptions[0].user
            const minutes = interaction.options._hoistedOptions[1].value
            const reasonForTimeout = interaction.options._hoistedOptions[2].value
            
            userToTimeout = interaction.guild.members.cache.get(userToTimeout.id)

            const modChannel = interaction.guild.channels.cache.get(process.env.MODERATORS_CHANNEL_ID)
            if(!modChannel) return

            try {
                userToTimeout.timeout(minutes * 60 * 1000, reasonForTimeout)
            } catch(err) {
                return console.log(err)
            }

            const logEmbed = new EmbedBuilder()
                .setTitle(userToTimeout.user.tag + ` was timed out for ${minutes} minutes.`)
                .addFields([
                    { name: 'User ID: ', value: `${userToTimeout.id}`},
                    { name: 'By: ', value: `${interaction.user}`},
                    { name: 'Reason: ', value: reasonForTimeout},
                ])
                .setColor('0xdf0000')
                .setThumbnail(userToTimeout.displayAvatarURL({ dynamic : true }))
                .setFooter({
                    text: interaction.guild.name, 
                    iconURL: interaction.guild.iconURL({ dynamic : true })
                })
                .setTimestamp()
            modChannel.send({ embeds: [logEmbed] })

            const timeoutEmbed = new EmbedBuilder()
                .setTitle(`You were timed out from **${interaction.guild.name}**.`)
                .setDescription(reasonForTimeout)
                .setColor('0xdf0000')
                .setFooter({
                    text: interaction.guild.name, 
                    iconURL: interaction.guild.iconURL({ dynamic : true })
                })
                .setTimestamp()
            
            try {
                await userToTimeout.send({ embeds: [timeoutEmbed] })
            } catch(err) {
                console.log(err)
            }
                
            const timedOutEmbed = new EmbedBuilder()
                .setDescription(`${userToTimeout} was timed out for ${minutes} minutes.`)
                .setColor('0x32ff25')
            interaction.reply({ embeds: [timedOutEmbed] })

        } else {
            const permsEmbed = new EmbedBuilder()
                .setDescription('You do not have permission to use this command.')
                .setColor('0xdf0000')
            return interaction.reply({ embeds: [permsEmbed], ephemeral: true })
        }
	},
}