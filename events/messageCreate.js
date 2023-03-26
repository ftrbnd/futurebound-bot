const { EmbedBuilder, ChannelType, MessageType, Message } = require('discord.js');
const Gpt = require('../schemas/GptSchema');

module.exports = {
	name: 'messageCreate',
	async execute(message) {
        if(message.author.bot) return; // ignore bot messages

        if (message.channel.type === ChannelType.DM) {
            handleDirectMessage(message);

        } else {
            const introductionsChannel = message.guild.channels.cache.get(process.env.INTRODUCTIONS_CHANNEL_ID);
            if (!introductionsChannel) return;
            // react to messages in introductions channel
            if (message.channel.id === process.env.INTRODUCTIONS_CHANNEL_ID) {
                const kermitHearts = message.guild.emojis.cache.get(process.env.KERMITHEARTS_EMOJI_ID);
                message.react(kermitHearts);
            }

            switch (message.type) {
                case MessageType.GuildBoostTier3:
                    handleServerBoosts(message, 3);
                    break;
                case MessageType.GuildBoostTier2:
                    handleServerBoosts(message, 2);
                    break;
                case MessageType.GuildBoostTier1:
                    handleServerBoosts(message, 1);
                    break;
                case MessageType.GuildBoost:
                    handleServerBoosts(message, 0);
                    break;
                case MessageType.RoleSubscriptionPurchase:
                    handleServerSubscriptions(message);
                    break;
            }

            if (message.mentions.has(message.client.user) && !message.author.bot) {
                handleMentions(message);
            }
        }
	},
}

function handleDirectMessage(message) {
    const logChannel = message.client.guilds.cache.get(process.env.GUILD_ID).channels.cache.get(process.env.LOGS_CHANNEL_ID);
    if(!logChannel) return;

    if(message.attachments.size > 0) return; // ignore any media sent to DMs

    const dmEmbed = new EmbedBuilder()
        .setAuthor({
            name: `DM from ${message.author.tag}`,
            iconURL: `${message.author.displayAvatarURL({ dynamic : true })}` // message + their avatar
        })
        .setDescription(message.content)
        .setColor('7289da')
        .setFooter({
            text: `User ID: ${message.author.id}`
        })
        .setTimestamp();

    return logChannel.send({ embeds: [dmEmbed] });
}

function handleServerBoosts(message, level) {
    const generalChannel = message.guild.channels.cache.get(process.env.GENERAL_CHANNEL_ID);
    if(!generalChannel) return;

    const futureboundRole = message.guild.roles.cache.get(process.env.FUTUREBOUND_ROLE_ID);

    const boostEmbed = new EmbedBuilder()
        .setAuthor({
            name: `${message.member.displayName} just boosted the server!`,
            iconURL: `${message.member.user.displayAvatarURL({ dynamic : true })}` // message + their avatar
        })        
        .setColor('f47fff') // pink boost color
        .setThumbnail('https://emoji.gg/assets/emoji/1819_boostingtop.gif') // nitro boost gif
        .addFields([
            { name: 'Server Level', value: `${message.guild.premiumTier}`, inline: true },
            { name: 'Server Boosts', value: `${message.guild.premiumSubscriptionCount}`, inline: true },
        ])
        .setFooter({
            text: `${message.guild.name}`, // server name
            iconURL: `${message.guild.iconURL({ dynamic : true })}` // server icon
        })
        .setTimestamp(); // when the boost happened

    const levelAnnouncements = new Map();
    levelAnnouncements.set(3, `\n**${message.guild.name}** has achieved **Level 3**!`);
    levelAnnouncements.set(2, `\n**${message.guild.name}** has achieved **Level 2**!`);
    levelAnnouncements.set(1, `\n**${message.guild.name}** has achieved **Level 1**!`);
    levelAnnouncements.set(0, ' ');

    console.log(`${message.member.displayName} just boosted the server!`);
    boostEmbed.setDescription(`Server booster role: ${futureboundRole} ${levelAnnouncements.get(level)}`);
    generalChannel.send({ content: `${message.author}`, embeds: [boostEmbed] });
}

async function handleMentions(message) {
    await message.channel.sendTyping();

    if(message.content.includes('good morning') || message.content.includes('gomo') || message.content.includes('Gomo') || message.content.includes('Morning') || message.content.includes('morning') || message.content.includes('gm') || message.content.includes('Good Morning') || message.content.includes('Good morning') || message.content.includes('GOOD MORNING')) {
        const messages = ['GOOD MORNING!', 'good morning x', 'goooood morning', 'mornin', 'gomo'];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        return message.reply({ content: randomMessage});
    }
    else if(message.content.includes('good night') || message.content.includes('goodnight') || message.content.includes('nini') || message.content.includes('gn') || message.content.includes('night')) {
        const messages = ['nini', 'night night', 'gn x', 'good night x', 'dont let the bed bugs bite x'];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        return message.reply({ content: randomMessage});
    }
    else if(message.content.includes('hey') || message.content.includes('hi') || message.content.includes('hello') || message.content.includes('Hi') || message.content.includes('Hello') || message.content.includes('Hey')) {
        const messages = ['hello x', 'hey', 'hi x'];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        return message.reply({ content: randomMessage});
    }
    else if(message.content.includes('how are you') || message.content.includes('how are u') || message.content.includes('how r u')) {
        const messages = ['i am ok', 'just vibing', 'im good !', ':/'];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        return message.reply({ content: randomMessage});
    }
    else if(message.content.includes('what\'s up') || message.content.includes('whats up') || message.content.includes('sup') || message.content.includes('What\'s up') || message.content.includes('Sup')) {
        const messages = ['nothing much', 'just vibing', 'been looking at the sky', 'sup'];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        return message.reply({ content: randomMessage});
    }
    else if(message.content.includes('sex') || message.content.includes('catching feelings')) {
        return message.channel.send(`catching feelings > sex`);
    }
    else if(message.content.includes('love') || message.content.includes('ily')) {
        const messages = ['i love you too x', 'ily2 x'];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        return message.reply({ content: randomMessage});
    }
    else if(message.content.includes('miss you') || message.content.includes('miss u')) {
        const messages = ['i miss you too :((', 'miss u 2 x'];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        return message.reply({ content: randomMessage});
    }
    else if(message.content.includes('how old are you') || message.content.includes('how old are u') || message.content.includes('how old')) {
        const messages = ['i am 26', '26']; 
        const randomMessage = messages[Math.floor(Math.random() * messages.length)]; 
        return message.reply({ content: randomMessage});
    }
    else if(message.content.includes('grape')) {
        const messages = ['shut up you grape lookin 🍇', '🍇'];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        return message.reply({ content: randomMessage});
    }
    else if(message.content.includes('oh no')) {
        return message.reply({ content: `i think i'm catching feelings`});
    }

    await handleGPTMessage(message);
}

function handleServerSubscriptions(message) {
    const generalChannel = message.guild.channels.cache.get(process.env.GENERAL_CHANNEL_ID);
    if(!generalChannel) return;

    const premiumRoles = [
        "1048015470168637440", // Final Call
        "1048015082191335488", // Bipolar Paradise
        "1048014115567837188", // Entrance
    ];
    const premiumRole = message.guild.roles.cache.get(premiumRoles.find(roleId => message.member._roles.includes(roleId)));

    const action = message.roleSubscriptionData.isRenewal ? 'renewed' : 'joined';
    const monthPlural = message.roleSubscriptionData.totalMonthsSubscribed > 1 ? 'months' : 'month';

    const subscriptionEmbed = new EmbedBuilder()
        .setAuthor({
            name: `${message.member.displayName} ${action} ${message.roleSubscriptionData.tierName} and has been a subscriber of ${message.guild.name} for ${message.roleSubscriptionData.totalMonthsSubscribed} ${monthPlural}!`,
            iconURL: message.author.displayAvatarURL({ dynamic : true})
        })
        .setDescription(`[${message.roleSubscriptionData.tierName} role: ${premiumRole}](https://discord.com/channels/655655072885374987/role-subscriptions)`)
        .setColor(premiumRole.hexColor)
        .setThumbnail('https://i.imgur.com/kzhphkQ.png') // eden logo
        .setFooter({
            text: `${message.guild.name}`,
            iconURL: `${message.guild.iconURL({ dynamic : true })}`
        })
        .setTimestamp();

    generalChannel.send({ content: `${message.author}`, embeds: [subscriptionEmbed] });
}

async function handleGPTMessage(message) {
    const { ChatGPTUnofficialProxyAPI } = await import('chatgpt');

    const api = new ChatGPTUnofficialProxyAPI({
        accessToken: process.env.OPENAI_ACCESS_TOKEN,
        apiReverseProxyUrl: 'https://bypass.duti.tech/api/conversation'
    });

    await Gpt.find((err, data) => {
        if (err) {
            const errEmbed = new EmbedBuilder()
                .setDescription('An error occurred.')
                .setColor(process.env.ERROR_COLOR);
            message.reply({ embeds: [errEmbed] });
            return console.log(err);``
        }

        if (!data || data.length == 0) {
            api.sendMessage(message.content)
                .then(res => {
                    message.reply({ content: res.text.toLowerCase() });

                    Gpt.create({
                        parentMessageId: res.id,
                        conversationId: res.conversationId
                    }).catch(err => console.error(err));

                    return console.log(`Created a new GPT document in database with parentMessageId ${res.id}`);
                });
        } else { // if data exists, get votes
            api.sendMessage(message.content, {
                parentMessageId: data[0].parentMessageId,
                conversationId: data[0].conversationId
            }).then(res => {
                data[0].parentMessageId = res.id;
                data[0].conversationId = res.conversationId;
                data[0].save();

                return message.reply({ content: res.text.toLowerCase() });
            })
        }
    }).clone();
}