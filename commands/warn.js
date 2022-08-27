require('dotenv').config()

const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js')
const User = require('../schemas/UserSchema')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('warn')
		.setDescription('Warn a user')
        .addUserOption(option =>
            option.setName('user')
            .setDescription('The user to be warned')
            .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
            .setDescription('The reason for the warn')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles), // any permission that the Helper role has access to should work
		
	async execute(interaction) {
        if(interaction.member.roles.cache.has(process.env.MODERATORS_ROLE_ID) || interaction.member.roles.cache.has(process.env.HELPER_ROLE_ID)) { // Moderator and Helper roles
            const userToWarn = interaction.options._hoistedOptions[0].user
            const reasonForWarn = interaction.options._hoistedOptions[1].value

            const modChannel = interaction.guild.channels.cache.get(process.env.MODERATORS_CHANNEL_ID)
            if(!modChannel) return

            var warnCount
            await User.findOne({ discordId: userToWarn.id }, (err, data) => {
                if(err) return console.log(err)
    
                if(!data) { // if the user isn't already in the database, add their data
                    User.create({
                        discordId: userToWarn.id,
                        username: userToWarn.username,
                        warnings: 1
                    }).catch(err => console.log(err))
                    warnCount = 1    
                } else { // if they already were in the database, simply update and save
                    data.warnings += 1
                    data.username = userToWarn.username
                    data.save()
                    warnCount = data.warnings
                }
            }).clone()

            const logEmbed = new EmbedBuilder()
                .setTitle(userToWarn.tag + ' was warned.')
                .addFields([
                    { name: 'User ID: ', value: `${userToWarn.id}`},
                    { name: 'By: ', value: `${interaction.user}`},
                    { name: 'Reason: ', value: reasonForWarn},
                    { name: 'Warnings: ', value: `${warnCount}`}
                ])
                .setColor('0xffd100')
                .setThumbnail(userToWarn.displayAvatarURL({ dynamic : true }))
                .setFooter({
                    text: interaction.guild.name, 
                    iconURL: interaction.guild.iconURL({ dynamic : true })
                })
                .setTimestamp()
            modChannel.send({ embeds: [logEmbed] })

            const warnEmbed = new EmbedBuilder()
                .setTitle(`You were warned in **${interaction.guild.name}**.`)
                .setDescription(reasonForWarn)
                .addFields([
                    { name: 'Warnings: ', value: `${warnCount}`}
                ])
                .setColor('0xffd100')
                .setFooter({
                    text: interaction.guild.name, 
                    iconURL: interaction.guild.iconURL({ dynamic : true })
                })
                .setTimestamp()
            
            try {
                await userToWarn.send({ embeds: [warnEmbed] })
            } catch(err) {
                return console.log(err)
            }

            const warnedEmbed = new EmbedBuilder()
                .setDescription(`${userToWarn} was warned.`)
                .setColor('0xffd100')
            interaction.reply({ embeds: [warnedEmbed] })

        } else {
            const permsEmbed = new EmbedBuilder()
                .setDescription('You do not have permission to use this command.')
                .setColor('0xdf0000')
            return interaction.reply({ embeds: [permsEmbed], ephemeral: true })
        }
	},
}