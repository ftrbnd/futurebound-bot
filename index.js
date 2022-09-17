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
// const twitter = require('./twitter')
// twitter.execute(client)

// Reddit
const reddit = require('./reddit')
reddit.execute(client)

// Mongo DB
const mongoDB = require('./mongoDB')
mongoDB.execute(client)