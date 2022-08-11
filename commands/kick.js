require('dotenv').config()

const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed, PermissionFlagsBits } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('kick')
		.setDescription('Kick a user from the server')
        .addUserOption(option =>
            option.setName('user')
            .setDescription('The user to be kicked')
            .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
            .setDescription('The reason for the kick')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),  // only the Server Moderator role can use this command
		
	async execute(interaction) {
        if(interaction.member.roles.cache.has(process.env.MODERATORS_ROLE_ID)) { // Moderator role
            const userToKick = interaction.options._hoistedOptions[0].user
            const reasonForKick = interaction.options._hoistedOptions[1].value

            const modChannel = interaction.guild.channels.cache.get(process.env.MODERATORS_CHANNEL_ID)
            if(!modChannel) return

            const logEmbed = new MessageEmbed()
                .setTitle(userToKick.tag + ' was kicked.')
                .addField('User ID: ', `${userToKick.id}`, true)        
                .addField('By: ', `${interaction.user}`, true)
                .addField('Reason: ', reasonForKick)
                .setColor(0xdf0000)
                .setThumbnail(userToKick.displayAvatarURL({ dynamic : true }))
                .setFooter({
                    text: interaction.guild.name, 
                    iconURL: interaction.guild.iconURL({ dynamic : true })
                })
                .setTimestamp()
            modChannel.send({ embeds: [logEmbed] })

            const kickEmbed = new MessageEmbed()
                .setTitle(`You were kicked from **${interaction.guild.name}**.`)
                .setDescription(reasonForKick)
                .setColor(0xdf0000)
                .setFooter({
                    text: interaction.guild.name, 
                    iconURL: interaction.guild.iconURL({ dynamic : true })
                })
                .setTimestamp()
            
            try {
                await userToKick.send({ embeds: [kickEmbed] })
            } catch(err) {
                console.log(err)
            }
                
            const kickedEmbed = new MessageEmbed()
                .setDescription(`${userToKick} was kicked.`)
                .setColor(0x32ff25)
            interaction.reply({ embeds: [kickedEmbed] })

            interaction.guild.members.kick(userToKick, options = { reason: reasonForKick})
        } else {
            const permsEmbed = new MessageEmbed()
                .setDescription('You do not have permission to use this command.')
                .setColor(0xdf0000)
            return interaction.reply({ embeds: [permsEmbed], ephemeral: true })
        }
	},
}