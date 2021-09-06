const { MessageEmbed } = require('discord.js')

module.exports = {
	name: 'messageDelete',
	async execute(message) {
        const channel = message.guild.channels.cache.find(channel => channel.name === "spam")
		if(!channel) return
		if(message.author.bot) return
			
		const msgDeleteEmbed = new MessageEmbed()
			.setAuthor(`${message.author.tag} deleted a message.`, message.author.displayAvatarURL({ dynamic : true} ))
			.setDescription(message.content)
			.addField('Channel', message.channel.name)
			.setColor(0xdf0000)
			.setTimestamp()
		channel.send({ embeds: [msgDeleteEmbed] })
	},
}