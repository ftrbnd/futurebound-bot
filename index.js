require('dotenv').config()
const fs = require('fs')

// Discord
const { Client, Collection, EmbedBuilder, Partials, GatewayIntentBits, SelectMenuOptionBuilder} = require('discord.js')
const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildBans, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.DirectMessages],
    partials: [Partials.Channel]
})

client.commands = new Collection()
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))  // Command handler
for (const file of commandFiles) {
	const command = require(`./commands/${file}`)
	// set a new item in the Collection
	// with the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command)
}

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js')) // Event handler
for(const file of eventFiles) {
	const event = require(`./events/${file}`)
	if(event.once) {
        client.once(event.name, (...args) => event.execute(...args))
	} else {
        client.on(event.name, (...args) => event.execute(...args))
	}
}

// DisTube - music bot
const { DisTube } = require('distube')
client.DisTube = new DisTube(client, {
    leaveOnStop: false,
    leaveOnEmpty: true,
    emitNewSongOnly: true,
    emitAddSongWhenCreatingQueue: false,
    emitAddListWhenCreatingQueue: true,
})

const musicCommandFiles = fs.readdirSync('./musicCommands').filter(file => file.endsWith('.js'))  // Command handler
for (const file of musicCommandFiles) {
	const musicCommand = require(`./musicCommands/${file}`)
	client.commands.set(musicCommand.data.name, musicCommand) // the commands Collection was initialized before the regular commands
}

const musicEventFiles = fs.readdirSync('./musicEvents').filter(file => file.endsWith('.js')) // Event handler
for(const file of musicEventFiles) {
	const musicEvent = require(`./musicEvents/${file}`)
    if(musicEvent.once) {
        client.DisTube.once(musicEvent.name, (...args) => musicEvent.execute(...args))
    } else {
        client.DisTube.on(musicEvent.name, (...args) => musicEvent.execute(...args))
    }
}

client.login(process.env.DISCORD_TOKEN)

// Twitter
const twitter = require('./twitter')
twitter.execute(client)

// Reddit
const reddit = require('./reddit')
reddit.execute(client)

// Mongo DB

const mongoose = require('mongoose')
const User = require('./schemas/UserSchema')

mongoose.connect(process.env.MONGODB_URI)
    .then((m) => {
        console.log(`Connected to ${m.connections[0].name}!`)
    }).catch((err) => console.log(err))

setInterval(() => {
    User.find((err, data)=> { // is there a birthday today?
        if(data) {
            var today = new Date()
            // console.log(`\nChecking for birthdays/mutes... Today's date: ${today}`)
    
            const numberEndings = new Map()
            numberEndings.set(13, 'th')
            numberEndings.set(12, 'th')
            numberEndings.set(11, 'th')
            numberEndings.set(3, 'rd')
            numberEndings.set(2, 'nd')
            numberEndings.set(1, 'st')

            const futureboundGuild = client.guilds.cache.get(process.env.GUILD_ID)
            const modChannel = futureboundGuild.channels.cache.get(process.env.MODERATORS_CHANNEL_ID)
            if(!modChannel) return
    
            data.forEach(user => {
                if(user.birthday) { // not all users may have birthdays due to warn command
                    if(today.getMonth() === user.birthday.getMonth() && today.getDate() === user.birthday.getDate() && today.getHours() === user.birthday.getHours() && today.getMinutes() === user.birthday.getMinutes()) {
                        var age = today.getFullYear() - user.birthday.getFullYear()
        
                        var ageSuffix
                        for(const [number, suffix] of numberEndings.entries()) { // every number ends with 'th' except for numbers that end in 1, 2, or 3
                            if(`${age}`.endsWith(`${number}`)) {
                                ageSuffix = suffix
                                break
                            } else {
                                ageSuffix = "th"
                            }
                        }
        
                        var balloons = ''
                        for(var i = 0; i < age; i++) {
                            balloons += '🎈'
                        }
        
                        var bdayDescription
                        // if(age < 18) {
                        //     bdayDescription = `It's ${user.username}'s birthday today!`
                        // } else {
                        //     bdayDescription = `It's ${user.username}'s ${age}${ageSuffix} birthday today!`
                        // }
                        bdayDescription = `It's ${user.username}'s birthday today! 🥳🎈🎉`
    
                        const birthdayPerson = futureboundGuild.members.fetch(user.discordId)
                            .then(birthdayPerson => {
                                const birthdayEmbed = new EmbedBuilder()
                                    .setTitle(bdayDescription)
                                    .setDescription(balloons)
                                    .setColor('0xffffc5')
                                    .setThumbnail(birthdayPerson.user.displayAvatarURL({ dynamic : true }))
                                    .setFooter({
                                        text: `Use the /birthday command to set your own birthday`, 
                                        iconURL: `${futureboundGuild.iconURL({ dynamic : true })}`
                                    })
        
                                try {
                                    birthdayPerson.send({ content: 'happy birthday!! 🥳' })
                                } catch(error) {
                                    console.log(`Failed to dm ${user.username}`)
                                    console.log(error)
                                }
                                const generalChannel = client.channels.cache.get(process.env.GENERAL_CHANNEL_ID)
                                generalChannel.send({ embeds: [birthdayEmbed] })
                                console.log(`It's ${user.username}'s ${age}${ageSuffix} birthday today! - ${user.birthday}`)
                            })
                            .catch(console.error)
                    }
                }    

                if(user.muteEnd) { // if a user has a muteEnd date != null
                    if(today.getFullYear() === user.muteEnd.getFullYear() && today.getMonth() === user.muteEnd.getMonth() && today.getDate() === user.muteEnd.getDate()) {
                        const userToUnmute = futureboundGuild.members.fetch(user.discordId)
                            .then(userToUnmute => {
                                try {
                                    userToUnmute.roles.set([]) // remove all roles - including Muted
                                } catch {
                                    console.error()
                                }

                                const logEmbed = new EmbedBuilder()
                                    .setTitle(userToUnmute.displayName + ' was unmuted after a week.')
                                    .addFields([
                                        { name: 'User ID: ', value: `${user.discordId}`},
                                    ])
                                    .setColor('0x32ff25')
                                    // .setThumbnail(userToUnmute.avatarURL())
                                    .setFooter({
                                        text: futureboundGuild.name, 
                                        iconURL: futureboundGuild.iconURL({ dynamic : true })
                                    })
                                    .setTimestamp()
                                modChannel.send({ embeds: [logEmbed] })

                                // remove the muteEnd date in the database so it doesn't trigger again
                                user.muteEnd = null
                                user.save()
                            })
                            .catch(console.error)
                    }
                }
            })
        } else {
            console.log(err)
        }
    })
}, 60000) // run this every minute