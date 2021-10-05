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
                break 
            case 'USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_2':
                console.log('Someone just boosted the server.')
                boostEmbed.setDescription(`Server booster role: <@&704966097434312766>. \n**futurebound** has achieved **Level 2**!`)
                welcomeChannel.send({ content: `${message.author}`, embeds: [boostEmbed]})
                generalChannel.send({ embeds: [boostEmbed] })
                break 
            case 'USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_1':
                console.log('Someone just boosted the server.')
                boostEmbed.setDescription(`Server booster role: <@&704966097434312766>. \n**futurebound** has achieved **Level 1**!`)
                welcomeChannel.send({ content: `${message.author}`, embeds: [boostEmbed]})
                generalChannel.send({ embeds: [boostEmbed] })
                break 
            case 'USER_PREMIUM_GUILD_SUBSCRIPTION':
                console.log('Someone just boosted the server.')
                boostEmbed.setDescription(`Server booster role: <@&704966097434312766>.`)
                welcomeChannel.send({ content: `${message.author}`, embeds: [boostEmbed]})
                generalChannel.send({ embeds: [boostEmbed] })
                break 
        }

        if(message.mentions.has(client.user) && !message.author.bot) {
            if(message.content.includes('good morning') || message.content.includes('Morning') || message.content.includes('morning') || message.content.includes('gm') || message.content.includes('Good Morning') || message.content.includes('Good morning') || message.content.includes('GOOD MORNING')) {
                const messages = ['GOOD MORNING!', 'good morning x', 'goooood morning', 'mornin'] 
                var randomMessage = messages[Math.floor(Math.random() * messages.length)] 
                message.reply({ content: `${message.author} ` + randomMessage})
            }
            else if(message.content.includes('good night') || message.content.includes('goodnight') || message.content.includes('nini') || message.content.includes('gn') || message.content.includes('night')) {
                const messages = ['nini', 'night night', 'gn x', 'good night x', 'dont let the bed bugs bite x'] 
                var randomMessage = messages[Math.floor(Math.random() * messages.length)] 
                message.reply({ content: `${message.author} ` + randomMessage})
            }
            else if(message.content.includes('hey') || message.content.includes('hi') || message.content.includes('hello') || message.content.includes('Hi') || message.content.includes('Hello') || message.content.includes('Hey')) {
                const messages = ['hello x', 'hey', 'hi x'] 
                var randomMessage = messages[Math.floor(Math.random() * messages.length)] 
                message.reply({ content: `${message.author} ` + randomMessage})
            }
            else if(message.content.includes('how are you') || message.content.includes('how are u') || message.content.includes('how r u')) {
                const messages = ['i am ok', 'just vibing', 'im good !', ':/'] 
                var randomMessage = messages[Math.floor(Math.random() * messages.length)] 
                message.reply({ content: `${message.author} ` + randomMessage})
            }
            else if(message.content.includes('what\'s up') || message.content.includes('whats up') || message.content.includes('sup') || message.content.includes('What\'s up') || message.content.includes('Sup')) {
                const messages = ['nothing much', 'just vibing', 'been looking at the sky', 'sup'] 
                var randomMessage = messages[Math.floor(Math.random() * messages.length)] 
                message.reply({ content: `${message.author} ` + randomMessage})
            }
            else if(message.content.includes('sex') || message.content.includes('catching feelings')) {
                message.channel.send(`catching feelings > sex`) 
            }
            else if(message.content.includes('love') || message.content.includes('ily')) {
                const messages = ['i love you too x', 'ily2 x'] 
                var randomMessage = messages[Math.floor(Math.random() * messages.length)] 
                message.reply({ content: `${message.author} ` + randomMessage})
            }
            else if(message.content.includes('miss you') || message.content.includes('miss u')) {
                const messages = ['i miss you too :((', 'miss u 2 x'] 
                var randomMessage = messages[Math.floor(Math.random() * messages.length)] 
                message.reply({ content: `${message.author} ` + randomMessage})
            }
            else if(message.content.includes('how old are you') || message.content.includes('how old are u') || message.content.includes('how old')) {
                const messages = ['i am 24', '24'] 
                var randomMessage = messages[Math.floor(Math.random() * messages.length)] 
                message.reply({ content: `${message.author} ` + randomMessage})
            }
            else if(message.content.includes('grape')) {
                const messages = ['shut up you grape lookin 🍇', '🍇'] 
                var randomMessage = messages[Math.floor(Math.random() * messages.length)] 
                message.reply({ content: randomMessage})
            }
            else if(message.content.includes('oh no')) {
                message.reply({ content: `i think i'm catching feelings`})
            }
        }
	},
}