require('dotenv').config()

const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dm')
		.setDescription('DM a message to a user')
        .addUserOption(option =>
            option.setName('user')
            .setDescription('The user to message')
            .setRequired(true))
        .addStringOption(option => 
            option.setName('message')
            .setDescription('What the bot should send')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),  // only the Server Moderator role can use this command
		
	async execute(interaction) {
        if(interaction.member.roles.cache.has(process.env.MODERATORS_ROLE_ID)) { // Moderator role
            const targetUser = interaction.options.getUser('user')
            const messageToSend = interaction.options.getString('message')
            
            try {
                const dmChannel = await targetUser.createDM()
                await dmChannel.sendTyping()
                dmChannel.send(messageToSend)
            } catch(err) {
                return console.log(err)
            }
            
            const sentEmbed = new EmbedBuilder()
                .setDescription(`Sent **"${messageToSend}"** to ${targetUser}`)
                .setColor('0x32ff25')

            return interaction.reply({ embeds: [sentEmbed] })
        } else {
            const permsEmbed = new EmbedBuilder()
                .setDescription('You do not have permission to use this command.')
                .setColor('0xdf0000')
            return interaction.reply({ embeds: [permsEmbed], ephemeral: true })
        }
	},
}