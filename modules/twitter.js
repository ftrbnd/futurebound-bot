const { ETwitterStreamEvent, TweetStream, TwitterApi, ETwitterApiError } = require('twitter-api-v2')

module.exports = {
	async execute(client) {
        const twitterClient = new TwitterApi({
            appKey: process.env.CONSUMER_KEY,
            appSecret: process.env.CONSUMER_SECRET,
            accessToken: process.env.ACCESS_TOKEN,
            accessSecret: process.env.ACCESS_TOKEN_SECRET
        })

        // idk about everything below this

        const stream = await twitterClient.v1.filterStream({
            follow: [process.env.TWITTER_USER_ID],
        })
        // Enable reconnect feature
        stream.autoReconnect = true

        try {
            // Awaits for a tweet
            stream.on(ETwitterStreamEvent.ConnectionError, err => {
                console.log('Twitter connection error!', err)
            })
            .on(ETwitterStreamEvent.ConnectionClosed, () => {
                console.log('Twitter connection has been closed.')
                stream.reconnect()
            })
            .on(ETwitterStreamEvent.ConnectionLost, () => 
                console.log('Twitter connection has been lost.'),
            )
            .on(ETwitterStreamEvent.ReconnectAttempt, () => 
                console.log('Twitter attempting reconnect...'),
            )
            .on(ETwitterStreamEvent.Connected, () => 
                console.log('Twitter connection successful!'),
            )
            .on(ETwitterStreamEvent.ConnectError, err => {
                console.log('Twitter connection error.', err)
            })
            .on(ETwitterStreamEvent.Reconnected, () => 
                console.log('Twitter reconnection successfull!.'),
            )
            .on(ETwitterStreamEvent.ReconnectError, err => {
                console.log('Twitter reconnection error.', err)
            })
            .on(ETwitterStreamEvent.ReconnectLimitExceeded, () => {
                console.log('Twitter reconnect limit exceeded.')
            })
            .on(ETwitterStreamEvent.Data, eventData => {
                function isReply(tweet) {
                    if (tweet.retweeted_status || tweet.in_reply_to_status_id || tweet.in_reply_to_status_id_str || tweet.in_reply_to_user_id
                    || tweet.in_reply_to_user_id_str || tweet.in_reply_to_screen_name) 
                        return true
                    return false
                }
                
                const tweetURL = `https://twitter.com/${eventData.user.screen_name}/status/${eventData.id_str}`
                
                if(!isReply(eventData)) {
                    console.log('Twitter has sent something:', tweetURL)

                    const tweetChannel = client.channels.cache.get(process.env.TWEET_CHANNEL_ID)
                    const retweetEmoji = client.emojis.cache.get(process.env.RETWEET_EMOJI_ID)

                    tweetChannel.send({ content: tweetURL }) // send tweet
                        .then(() => tweetChannel.messages.fetch({ limit: 1 }) // fetch latest message
                        .then(messages => {
                            let lastMessage = messages.first() // message retrieved
                            lastMessage.react(retweetEmoji)     // react with retweet
                                .then(() => lastMessage.react('❤')) // react with heart
                        })
                        .catch(console.error))
                }
            })
            .on(ETwitterStreamEvent.DataKeepAlive, () => 
                console.log('Twitter has a keep-alive packet.'),
            )
            .on(ETwitterStreamEvent.DataError, err => 
                console.log('Twitter data error.', err),
            )
            .on(ETwitterStreamEvent.TweetParseError, err => 
                console.log('Tweet parse error.', err),
            )

        } catch(e) {
            console.log("Error occured in the try/catch block:", e)
        }
    }
}