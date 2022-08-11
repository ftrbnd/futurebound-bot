require('dotenv').config()

const { EmbedBuilder, ChannelType } = require('discord.js')

module.exports = {
	name: 'channelUpdate',
	async execute(oldChannel, newChannel) {
        const logChannel = oldChannel.guild.channels.cache.get(process.env.LOGS_CHANNEL_ID)
		if(!logChannel) return
			
        const channelType = (oldChannel.type === ChannelType.GuildText) ? "text" : "voice" // if oldChannel type is GUILD_TEXT, then set channelType to text

        if(oldChannel.name != newChannel.name) {
            const changedEmbed = new EmbedBuilder()
                .setTitle(`A ${channelType} channel's name was changed.`)
                .addFields(
                    { name: 'Previous name', value: oldChannel.name, inline: true },
                    { name: 'New name', value: newChannel.name, inline: true },
                )
                .setColor(0x32ff25)
                .setFooter({
                    text: `${oldChannel.guild.name}`, 
                    iconURL: oldChannel.guild.iconURL({ dynamic: true })
                })
                .setTimestamp()
            logChannel.send({ embeds: [changedEmbed] })
        }
	},
}