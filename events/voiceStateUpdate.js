require('dotenv').config()

const { MessageEmbed, Permissions } = require('discord.js')

module.exports = {
	name: 'voiceStateUpdate',
	async execute(oldState, newState) {

        const logChannel = oldState.guild.channels.cache.get(process.env.LOGS_CHANNEL_ID)
		if(!logChannel) return
        const voiceChat = oldState.guild.channels.cache.get(process.env.VOICE_CHAT_ID)
        if(!voiceChat) return

		if(newState.channel !== null && newState.channel.id === process.env.JOIN_TO_CREATE_ID) { // if they join the 'join to create' vc
			const parentCategory = newState.channel.parent

			const customVoiceChannel = await newState.guild.channels.create(`${newState.member.displayName}'s channel`, {
				type: 'GUILD_VOICE',
				parent: parentCategory,
				PermissionOverwrites: [
					{
						id: newState.member.id,
						allow: [Permissions.FLAGS.MANAGE_CHANNELS],
					},
				]
			})
			await newState.setChannel(customVoiceChannel)

			helloEmbed = new MessageEmbed()
				.setDescription('You just created your own voice channel! Feel free to edit the channel name to let others know what your channel is about. \nNOTE: Make sure you have **Two-Factor Authentication** enabled on your Discord account.')
				.setColor(0x32ff25)
				.setFooter(newState.guild.name, newState.guild.iconURL({ dynamic: true }))

			voiceChat.send({ content: `${newState.member}`, embeds: [helloEmbed] })
				.then(message => {
					setTimeout(() => message.delete(), 60000)// delete after one minute
				}) 
			
			const vcUpdateEmbed = new MessageEmbed()
				.setDescription(`${newState.member.user.tag} created **${customVoiceChannel.name}**`)
				.setColor(0x32ff25)
				.setFooter(`User ID: ${newState.member.user.id}`, newState.member.user.displayAvatarURL({ dynamic : true }));
			return logChannel.send({ embeds: [vcUpdateEmbed] })
		}

		if(!oldState.channel) { // if they join a channel
			joinEmbed = new MessageEmbed()
				.setDescription(`${newState.member.user} joined **${newState.channel.name}**`)
				.setColor(0x32ff25)
				.setTimestamp()
				.setFooter(`User ID: ${newState.member.user.id}`, newState.member.user.displayAvatarURL({ dynamic : true }))
				
			logChannel.send({ embeds: [joinEmbed] })

		} else if(!newState.channel) { // if they leave a channel
			leaveEmbed = new MessageEmbed()
				.setDescription(`${oldState.member.user} left **${oldState.channel.name}**`)
				.setColor(0xdf0000)
				.setTimestamp()
				.setFooter(`User ID: ${oldState.member.user.id}`, oldState.member.user.displayAvatarURL({ dynamic : true }))
				
			logChannel.send({ embeds: [leaveEmbed] })
		}
		
		if(oldState.channel.members.size === 0 && oldState.channel.parent.id === process.env.JOIN_TO_CREATE_CATEGORY_ID && oldState.channel.id !== process.env.JOIN_TO_CREATE_ID) { // once a custom channel is empty
			const vcUpdateEmbed = new MessageEmbed()
				.setDescription(`**${oldState.channel.name}** was deleted after being empty.`)
				.setColor(0xdf0000)
				.setTimestamp()
			
			oldState.channel.delete(`**${oldState.channel.name}** was deleted after being empty.`)

			logChannel.send({ embeds: [vcUpdateEmbed] })
		}
	},  
}