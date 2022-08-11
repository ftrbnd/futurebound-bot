require('dotenv').config()

const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed, PermissionFlagsBits } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Ban a user from the server')
        .addUserOption(option =>
            option.setName('user')
            .setDescription('The user to be banned')
            .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
            .setDescription('The reason for the ban')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),  // only the Server Moderator role can use this command
		
	async execute(interaction) {
        if(interaction.member.roles.cache.has(process.env.MODERATORS_ROLE_ID)) { // Moderator role
            const userToBan = interaction.options._hoistedOptions[0].user
            const reasonForBan = interaction.options._hoistedOptions[1].value

            const modChannel = interaction.guild.channels.cache.get(process.env.MODERATORS_CHANNEL_ID)
            if(!modChannel) return

            const logEmbed = new MessageEmbed()
                .setTitle(userToBan.tag + ' was banned.')
                .addField('User ID: ', `${userToBan.id}`, true)        
                .addField('By: ', `${interaction.user}`, true)
                .addField('Reason: ', reasonForBan)
                .setColor(0xdf0000)
                .setThumbnail(userToBan.displayAvatarURL({ dynamic : true }))
                .setFooter({
                    text: interaction.guild.name, 
                    iconURL: interaction.guild.iconURL({ dynamic : true })
                })
                .setTimestamp()
            modChannel.send({ embeds: [logEmbed] })

            const banEmbed = new MessageEmbed()
                .setTitle(`You were banned from **${interaction.guild.name}**.`)
                .setDescription(reasonForBan)
                .setColor(0xdf0000)
                .setFooter({
                    text: interaction.guild.name, 
                    iconURL: interaction.guild.iconURL({ dynamic : true })
                })
                .setTimestamp()
            
            try {
                await userToBan.send({ embeds: [banEmbed] })
            } catch(err) {
                console.log(err)
            }
                
            const bannedEmbed = new MessageEmbed()
                .setDescription(`${userToBan} was banned.`)
                .setColor(0x32ff25)
            interaction.reply({ embeds: [bannedEmbed] })

            interaction.guild.members.ban(userToBan, options = { reason: reasonForBan})
        } else {
            const permsEmbed = new MessageEmbed()
                .setDescription('You do not have permission to use this command.')
                .setColor(0xdf0000)
            return interaction.reply({ embeds: [permsEmbed], ephemeral: true })
        }
	},
}