require('dotenv').config();
const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

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
        const targetUser = interaction.options.getUser('user');
        const messageToSend = interaction.options.getString('message');
        
        try {
            const dmChannel = await targetUser.createDM();
            await dmChannel.sendTyping();
            dmChannel.send(messageToSend);
        } catch(err) {
            return console.error(err);
        }
        
        const sentEmbed = new EmbedBuilder()
            .setDescription(`Sent **"${messageToSend}"** to ${targetUser}`)
            .setColor('0x32ff25');

        return interaction.reply({ embeds: [sentEmbed] });
	},
}