require('dotenv').config()

const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js')

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
            const userToBan = interaction.options.getUser('user')
            const reasonForBan = interaction.options.getString('reason')

            const modChannel = interaction.guild.channels.cache.get(process.env.MODERATORS_CHANNEL_ID)
            if(!modChannel) return

            try {
                interaction.guild.members.ban(userToBan, options = { reason: reasonForBan})
            } catch(err) {
                return console.log(err)
            }

            const logEmbed = new EmbedBuilder()
                .setTitle(userToBan.tag + ' was banned.')
                .addFields([
                    { name: 'User ID: ', value: `${userToBan.id}`},
                    { name: 'By: ', value: `${interaction.user}`},
                    { name: 'Reason: ', value: reasonForBan},
                ])
                .setColor('0xdf0000')
                .setThumbnail(userToBan.displayAvatarURL({ dynamic : true }))
                .setFooter({
                    text: interaction.guild.name, 
                    iconURL: interaction.guild.iconURL({ dynamic : true })
                })
                .setTimestamp()
            modChannel.send({ embeds: [logEmbed] })

            const banEmbed = new EmbedBuilder()
                .setTitle(`You were banned from **${interaction.guild.name}**.`)
                .setDescription(reasonForBan)
                .setColor('0xdf0000')
                .setFooter({
                    text: interaction.guild.name, 
                    iconURL: interaction.guild.iconURL({ dynamic : true })
                })
                .setTimestamp()
            
            try {
                await userToBan.send({ embeds: [banEmbed] })
            } catch(err) {
                return console.log(err)
            }
                
            const bannedEmbed = new EmbedBuilder()
                .setDescription(`${userToBan} was banned.`)
                .setColor('0x32ff25')
            interaction.reply({ embeds: [bannedEmbed] })

        } else {
            const permsEmbed = new EmbedBuilder()
                .setDescription('You do not have permission to use this command.')
                .setColor('0xdf0000')
            return interaction.reply({ embeds: [permsEmbed], ephemeral: true })
        }
	},
}