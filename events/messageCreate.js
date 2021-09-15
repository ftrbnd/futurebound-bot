const { MessageEmbed } = require('discord.js')

module.exports = {
	name: 'messageCreate',
	async execute(message) {
        const welcomeChannel = message.guild.channels.cache.find(channel => channel.name === "welcome")
		if(!welcomeChannel) return
        const generalChannel = message.guild.channels.cache.find(channel => channel.name === "general")
        if(!generalChannel) return

        if(message.channel.type === 'DM') {
            const logChannel = message.guild.channels.cache.get(process.env.LOGS_CHANNEL_ID)
            if(!logChannel) return

            const dmEmbed = new MessageEmbed()
                .setAuthor(`Direct message from ${message.author.tag}`, message.author.displayAvatarURL({ dynamic : true }))
                .setDescription(message.content)
                .setColor(0x7289da)
                .setTimestamp()

            return logChannel.send({ embeds: [dmEmbed] })
        }

        const boostEmbed = new MessageEmbed()
            .setAuthor(message.member.displayName + ' just boosted the server!', message.member.user.displayAvatarURL({ dynamic : true })) // message + their avatar
            .setColor(0xf47fff) // pink boost color
            .setThumbnail('https://emoji.gg/assets/emoji/1819_boostingtop.gif') // nitro boost gif
            .addField('Server Level', `${message.guild.premiumTier}`, true)
            .addField('Server Boosts', `${message.guild.premiumSubscriptionCount}`, true)
            .setFooter(`${message.guild.name}`, `${message.guild.iconURL({ dynamic : true })}`) // server icon
            .setTimestamp() // when the boost happened

        switch(message.type) {
            case 'USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_3':
                console.log('Someone just boosted the server.')
                boostEmbed.setDescription(`Server booster role: <@&704966097434312766>. \n**futurebound** has achieved **Level 3**!`)
                welcomeChannel.send({ content: `${message.author}`, embeds: [boostEmbed]})
                generalChannel.send({ embeds: [boostEmbed] })
                break;
            case 'USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_2':
                console.log('Someone just boosted the server.')
                boostEmbed.setDescription(`Server booster role: <@&704966097434312766>. \n**futurebound** has achieved **Level 2**!`)
                welcomeChannel.send({ content: `${message.author}`, embeds: [boostEmbed]})
                generalChannel.send({ embeds: [boostEmbed] })
                break;
            case 'USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_1':
                console.log('Someone just boosted the server.')
                boostEmbed.setDescription(`Server booster role: <@&704966097434312766>. \n**futurebound** has achieved **Level 1**!`)
                welcomeChannel.send({ content: `${message.author}`, embeds: [boostEmbed]})
                generalChannel.send({ embeds: [boostEmbed] })
                break;
            case 'USER_PREMIUM_GUILD_SUBSCRIPTION':
                console.log('Someone just boosted the server.')
                boostEmbed.setDescription(`Server booster role: <@&704966097434312766>.`)
                welcomeChannel.send({ content: `${message.author}`, embeds: [boostEmbed]})
                generalChannel.send({ embeds: [boostEmbed] })
                break;
        }
	},
}