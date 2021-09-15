require('dotenv').config()

const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mute')
		.setDescription('Mute a user by giving them the Muted role')
        .addUserOption(option =>
            option.setName('user')
            .setDescription('The user to be muted')
            .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
            .setDescription('The reason for the mute')
            .setRequired(true)),
		
	async execute(interaction) {
        if(interaction.member.roles.cache.has(process.env.MODERATORS_ROLE_ID)) { // Moderator role
            const userToMute = interaction.options._hoistedOptions[0].user
            const reasonForMute = interaction.options._hoistedOptions[1].value

            const modChannel = interaction.guild.channels.cache.get(process.env.MODERATORS_CHANNEL_ID)
            if(!modChannel) return

            const logEmbed = new MessageEmbed()
                .setTitle(userToMute.tag + ' was muted.')
                .addField('User ID: ', `${userToMute.id}`, true)        
                .addField('By: ', `${interaction.user}`, true)
                .addField('Reason: ', reasonForMute)
                .setColor(0x000001)
                .setThumbnail(userToMute.displayAvatarURL({ dynamic : true }))
                .setFooter(interaction.guild.name, interaction.guild.iconURL({ dynamic : true }))
                .setTimestamp()
            modChannel.send({ embeds: [logEmbed] })

            const muteEmbed = new MessageEmbed()
                .setTitle(`You were muted in **${interaction.guild.name}**.`)
                .setDescription(reasonForMute)
                .setColor(0x000001)
                .setFooter(interaction.guild.name, interaction.guild.iconURL({ dynamic : true }))
                .setTimestamp()
            
            try {
                await userToMute.send({ embeds: [muteEmbed] })
            } catch(err) {
                console.log(err)
            }
            
            userToMuteMember = interaction.guild.members.cache.get(`${userToMute.id}`)
            userToMuteMember.roles.set([process.env.MUTE_ROLE_ID]) // Mute role

            const mutedEmbed = new MessageEmbed()
                .setDescription(`${userToMute} was muted.`)
                .setColor(0x32ff25)
            interaction.reply({ embeds: [mutedEmbed] })
        } else {
            const permsEmbed = new MessageEmbed()
                .setDescription('You do not have permission to use this command.')
                .setColor(0xdf0000)
            return interaction.reply({ embeds: [permsEmbed], ephemeral: true })
        }
	},
}