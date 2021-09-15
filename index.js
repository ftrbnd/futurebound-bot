require('dotenv').config()
const fs = require('fs')

const { Client, Collection, Intents } = require('discord.js')
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] })

const Twitter = require('twit')
const config = require('./config.js')
const twitterClient = new Twitter(config)

// Command handler
client.commands = new Collection()
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
	const command = require(`./commands/${file}`)
	// set a new item in the Collection
	// with the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command)
}

// Event handler
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'))
for(const file of eventFiles) {
	const event = require(`./events/${file}`)
	if(event.once) {
		client.once(event.name, (...args) => event.execute(...args))
	} else {
		client.on(event.name, (...args) => event.execute(...args))
	}
}

client.login(process.env.DISCORD_TOKEN)

function isReply(tweet) {
    if (tweet.retweeted_status || tweet.in_reply_to_status_id || tweet.in_reply_to_status_id_str || tweet.in_reply_to_user_id
    || tweet.in_reply_to_user_id_str || tweet.in_reply_to_screen_name) 
        return true
    return false
}

const stream = twitterClient.stream('statuses/filter', {
    follow: '1598790960', // twtter used id for @iameden
})

stream.on('tweet', tweet => {
    const twitterMessage = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`
    if(isReply(tweet) == false) {
        const tweetChannel = client.channels.cache.get(process.env.TWEET_CHANNEL_ID)
        const retweetEmoji = client.emojis.cache.get(process.env.RETWEET_EMOJI_ID)
        // now get last message and react with retweet and heart
        tweetChannel.send(twitterMessage) // send tweet
            .then(() => tweetChannel.messages.fetch({ limit: 1 }) // fetch latest message
            .then(messages => {
                let lastMessage = messages.first() // message retrieved
                lastMessage.react(retweetEmoji)     // react with retweet
                    .then(() => lastMessage.react('❤')) // react with heart
            })
            .catch(console.error))
    }
    return false
})