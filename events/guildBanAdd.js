require('dotenv').config()

const { MessageEmbed } = require('discord.js')

module.exports = {
	name: 'guildBanAdd',
	async execute(ban) {
        const modChannel = ban.guild.channels.cache.get(process.env.MODERATORS_CHANNEL_ID)
		if(!modChannel) return

        var log = new MessageEmbed()
            .setTitle(`${ban.user.username} was banned.`)
            .addField('User: ', `${ban.user}`, true)
            .addField('ID: ', `${ban.user.id}`)
            .setColor(0xdf0000)
            .setThumbnail(ban.user.displayAvatarURL({ dynamic : true }))
            .setFooter(ban.guild.name, ban.guild.iconURL({ dynamic : true }))
            .setTimestamp()
        modChannel.send({ embeds: [log] })
	},
}