require('dotenv').config()

const { MessageEmbed } = require('discord.js')

module.exports = {
	name: 'guildBanRemove',
	async execute(ban) {
        const modChannel = ban.guild.channels.cache.get(process.env.MODERATORS_CHANNEL_ID)
		if(!modChannel) return

        var log = new MessageEmbed()
            .setTitle(`${ban.user.username} was unbanned.`)
            .addField('User: ', `${ban.user}`, true)
            .addField('ID: ', `${ban.user.id}`)
            .setColor(0x32ff25)
            .setThumbnail(ban.user.displayAvatarURL({ dynamic : true }))
            .setFooter({
                text: ban.guild.name, 
                iconURL: ban.guild.iconURL({ dynamic : true })
            })
            .setTimestamp()
        modChannel.send({ embeds: [log] })
	},
}