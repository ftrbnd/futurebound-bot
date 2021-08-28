const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('say')
		.setDescription('Make the bot say something')
        .addChannelOption(option =>
            option.setName('channel')
            .setDescription('The channel the message should be sent in')
            .setRequired(true))
        .addStringOption(option => 
            option.setName('message')
            .setDescription('What the bot should say')
            .setRequired(true)),
		
	async execute(interaction) {
        const targetChannel = interaction.options._hoistedOptions[0].channel
        const messageToSend = interaction.options._hoistedOptions[1].value
        targetChannel.send(messageToSend)

        const sentEmbed = new MessageEmbed()
            .setDescription(`Said **"${messageToSend}"** in ${targetChannel}`)
            .setColor(0x32ff25)

        interaction.reply({ embeds: [sentEmbed] })
	},
}