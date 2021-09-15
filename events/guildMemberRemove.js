require('dotenv').config()

const { MessageEmbed } = require('discord.js')

module.exports = {
	name: 'guildMemberRemove',
	async execute(member) {
        const logChannel = member.guild.channels.cache.get(process.env.LOGS_CHANNEL_ID)
        if(!logChannel) return

        const leaveEmbed = new MessageEmbed()
            .setAuthor(member.displayName + ' has left the server.', member.user.displayAvatarURL({ dynamic : true}))
            .addField('User ID: ', `${member.user.id}`, true)
            .setColor(0xdf0000)
            .setThumbnail(member.user.displayAvatarURL({ dynamic : true}))
            .setFooter(member.guild.name, member.guild.iconURL({ dynamic : true}))
            .setTimestamp()

        logChannel.send({ embeds: [leaveEmbed] })
	},
}