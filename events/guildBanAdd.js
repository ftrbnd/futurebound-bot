require('dotenv').config()

const { EmbedBuilder } = require('discord.js')

module.exports = {
	name: 'guildBanAdd',
	async execute(ban) {
        const modChannel = ban.guild.channels.cache.get(process.env.MODERATORS_CHANNEL_ID)
		if(!modChannel) return

        var log = new EmbedBuilder()
            .setTitle(`${ban.user.username} was banned.`)
            .addField('User: ', `${ban.user}`, true)
            .addField('ID: ', `${ban.user.id}`)
            .setColor(0xdf0000)
            .setThumbnail(ban.user.displayAvatarURL({ dynamic : true }))
            .setFooter({
                text: ban.guild.name, 
                iconURL: ban.guild.iconURL({ dynamic : true })
            })
            .setTimestamp()
        modChannel.send({ embeds: [log] })
	},
}