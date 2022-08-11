require('dotenv').config()

const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js')

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
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles), // any permission that the Helper role has access to should work
		
	async execute(interaction) {
        if(interaction.member.roles.cache.has(process.env.MODERATORS_ROLE_ID) || interaction.member.roles.cache.has(process.env.HELPER_ROLE_ID)) { // Moderator and Helper roles
            const userToMute = interaction.options._hoistedOptions[0].user
            const reasonForMute = interaction.options._hoistedOptions[1].value

            const modChannel = interaction.guild.channels.cache.get(process.env.MODERATORS_CHANNEL_ID)
            if(!modChannel) return

            const logEmbed = new EmbedBuilder()
                .setTitle(userToMute.tag + ' was muted.')
                .addFields([
                    { name: 'User ID: ', value: `${userToMute.id}`},
                    { name: 'By: ', value: `${interaction.user}`},
                    { name: 'Reason: ', value: reasonForMute},
                ])
                .setColor('0x000001')
                .setThumbnail(userToMute.displayAvatarURL({ dynamic : true }))
                .setFooter({
                    text: interaction.guild.name, 
                    iconURL: interaction.guild.iconURL({ dynamic : true })
                })
                .setTimestamp()
            modChannel.send({ embeds: [logEmbed] })

            const muteEmbed = new EmbedBuilder()
                .setTitle(`You were muted in **${interaction.guild.name}**.`)
                .setDescription(reasonForMute)
                .setColor('0x000001')
                .setFooter({
                    text: interaction.guild.name, 
                    iconURL: interaction.guild.iconURL({ dynamic : true })
                })
                .setTimestamp()
            
            try {
                await userToMute.send({ embeds: [muteEmbed] })
            } catch(err) {
                console.log(err)
            }
            
            userToMuteMember = interaction.guild.members.cache.get(`${userToMute.id}`)
            userToMuteMember.roles.set([process.env.MUTE_ROLE_ID]) // Mute role

            const mutedEmbed = new EmbedBuilder()
                .setDescription(`${userToMute} was muted.`)
                .setColor('0x32ff25')
            interaction.reply({ embeds: [mutedEmbed] })
        } else {
            const permsEmbed = new EmbedBuilder()
                .setDescription('You do not have permission to use this command.')
                .setColor('0xdf0000')
            return interaction.reply({ embeds: [permsEmbed], ephemeral: true })
        }
	},
}