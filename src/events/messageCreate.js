import { EmbedBuilder, ChannelType, MessageType, ThreadAutoArchiveDuration } from 'discord.js';
import { env } from '../utils/env.js';
import { Colors, EDEN_LOGO, HEARDLE_URL } from '../utils/constants.js';
import { sendMessageInLogChannel } from '../utils/error-handler.js';

export const name = 'messageCreate';
export async function execute(message) {
  const logChannel = message.client.guilds.cache.get(env.GUILD_ID).channels.cache.get(env.LOGS_CHANNEL_ID);

  try {
    if (message.webhookId === env.HEARDLE_WEBHOOK_ID) {
      await handleHeardleWebhook(message);
    }

    if (message.author.bot) return; // ignore bot messages

    if (message.channel.type === ChannelType.DM) {
      await handleDirectMessage(message);
    } else {
      const introductionsChannel = message.guild.channels.cache.get(env.INTRODUCTIONS_CHANNEL_ID);
      if (!introductionsChannel) return;

      if (message.channel.id === env.INTRODUCTIONS_CHANNEL_ID) {
        const introReactionEmoji = message.guild.emojis.cache.get(env.INTRODUCTIONS_REACTION_EMOJI_ID);
        message.react(introReactionEmoji);
      }

      if (message.channel.id === env.BOT_BAIT_CHANNEL_ID) {
        await handleBotBaitMessage(message);
      }

      switch (message.type) {
        case MessageType.GuildBoostTier3:
          await handleServerBoosts(message, 3);
          break;
        case MessageType.GuildBoostTier2:
          await handleServerBoosts(message, 2);
          break;
        case MessageType.GuildBoostTier1:
          await handleServerBoosts(message, 1);
          break;
        case MessageType.GuildBoost:
          await handleServerBoosts(message, 0);
          break;
        case MessageType.RoleSubscriptionPurchase:
          await handleServerSubscriptions(message);
          break;
      }

      if ((message.channel.id == env.BOTS_CHANNEL_ID || message.member.roles.cache.has(env.MODERATORS_ROLE_ID)) && message.mentions.has(message.client.user) && !message.author.bot) {
        await handleMentions(message);
      }
    }
  } catch (error) {
    await sendMessageInLogChannel(null, error, logChannel);
  }
}

async function handleDirectMessage(message) {
  const logChannel = message.client.guilds.cache.get(env.GUILD_ID).channels.cache.get(env.LOGS_CHANNEL_ID);
  if (!logChannel) return;

  if (message.attachments.size > 0) return; // ignore any media sent to DMs

  const dmEmbed = new EmbedBuilder()
    .setAuthor({
      name: `DM from ${message.author.tag}`,
      iconURL: `${message.author.displayAvatarURL({ dynamic: true })}` // message + their avatar
    })
    .setDescription(message.content)
    .setColor(Colors.DM_COLOR)
    .setFooter({
      text: `User ID: ${message.author.id}`
    })
    .setTimestamp();

  await logChannel.send({ embeds: [dmEmbed] });
}

async function handleServerBoosts(message, level) {
  const generalChannel = message.guild.channels.cache.get(env.GENERAL_CHANNEL_ID);
  if (!generalChannel) return;

  const boosterRole = message.guild.roles.cache.get(env.BOOSTER_ROLE_ID);

  const boostEmbed = new EmbedBuilder()
    .setAuthor({
      name: `${message.member.displayName} just boosted the server!`,
      iconURL: `${message.member.user.displayAvatarURL({ dynamic: true })}` // message + their avatar
    })
    .setColor(Colors.BOOST_COLOR)
    .setThumbnail('https://emoji.gg/assets/emoji/1819_boostingtop.gif') // nitro boost gif
    .addFields([
      { name: 'Server Level', value: `${message.guild.premiumTier}`, inline: true },
      { name: 'Server Boosts', value: `${message.guild.premiumSubscriptionCount}`, inline: true }
    ])
    .setFooter({
      text: `${message.guild.name}`, // server name
      iconURL: `${message.guild.iconURL({ dynamic: true })}` // server icon
    })
    .setTimestamp(); // when the boost happened

  const levelAnnouncements = new Map();
  levelAnnouncements.set(3, `\n**${message.guild.name}** has achieved **Level 3**!`);
  levelAnnouncements.set(2, `\n**${message.guild.name}** has achieved **Level 2**!`);
  levelAnnouncements.set(1, `\n**${message.guild.name}** has achieved **Level 1**!`);
  levelAnnouncements.set(0, ' ');

  console.log(`${message.member.displayName} just boosted the server!`);
  boostEmbed.setDescription(`Server booster role: ${boosterRole} ${levelAnnouncements.get(level)}`);
  await generalChannel.send({ content: `${message.author}`, embeds: [boostEmbed] });
}

async function handleMentions(message) {
  await message.channel.sendTyping();

  const messageContent = message.content.split(' ');

  switch (true) {
    case messageContent.includes('good morning'):
    case messageContent.includes('gomo'):
    case messageContent.includes('morning'):
    case messageContent.includes('gm'):
    case messageContent.includes('goodmorning'):
      const messages1 = ['GOOD MORNING', 'good morning x', 'goooood morning', 'mornin', 'gomo'];
      const randomMessage1 = messages1[Math.floor(Math.random() * messages1.length)];
      await message.reply({ content: randomMessage1 });
      break;
    case messageContent.includes('good night'):
    case messageContent.includes('goodnight'):
    case messageContent.includes('nini'):
    case messageContent.includes('gn'):
      const messages2 = ['nini', 'night night', 'gn x', 'good night x', 'dont let the bed bugs bite x'];
      const randomMessage2 = messages2[Math.floor(Math.random() * messages2.length)];
      await message.reply({ content: randomMessage2 });
      break;
    case messageContent.includes('hi'):
    case messageContent.includes('hey'):
    case messageContent.includes('hello'):
      const messages3 = ['hello x', 'hey', 'hi x'];
      const randomMessage3 = messages3[Math.floor(Math.random() * messages3.length)];
      await message.reply({ content: randomMessage3 });
      break;
    case messageContent.includes('ily'):
    case messageContent.includes('i love you'):
    case messageContent.includes('i love u'):
      const messages4 = ['i love you too x', 'ily2 x', 'i love u more'];
      const randomMessage4 = messages4[Math.floor(Math.random() * messages4.length)];
      await message.reply({ content: randomMessage4 });
      break;
  }
}

async function handleServerSubscriptions(message) {
  const generalChannel = message.guild.channels.cache.get(env.GENERAL_CHANNEL_ID);
  if (!generalChannel) return;

  const premiumRole = message.guild.roles.cache.get(env.SUBSCRIBER_ROLE_IDS.find((roleId) => message.member._roles.includes(roleId)));

  const action = message.roleSubscriptionData.isRenewal ? 'renewed' : 'joined';
  const monthPlural = message.roleSubscriptionData.totalMonthsSubscribed > 1 ? 'months' : 'month';

  const subscriptionEmbed = new EmbedBuilder()
    .setAuthor({
      name: `${message.member.displayName} ${action} ${message.roleSubscriptionData.tierName} and has been a subscriber of ${message.guild.name} for ${message.roleSubscriptionData.totalMonthsSubscribed} ${monthPlural}!`,
      iconURL: message.author.displayAvatarURL({ dynamic: true })
    })
    .setDescription(`${message.roleSubscriptionData.tierName} role: ${premiumRole}`)
    .setColor(premiumRole.hexColor)
    .setThumbnail(EDEN_LOGO)
    .setFooter({
      text: `${message.guild.name}`,
      iconURL: `${message.guild.iconURL({ dynamic: true })}`
    })
    .setTimestamp();

  await generalChannel.send({ content: `${message.author}`, embeds: [subscriptionEmbed] });
}

async function handleHeardleWebhook(message) {
  const webhookEmbed = message.embeds[0];

  if (webhookEmbed.data.title.toLowerCase().includes('daily') && webhookEmbed.data.description.toLowerCase().includes('successfully')) {
    const heardleChannel = message.guild.channels.cache.get(env.HEARDLE_CHANNEL_ID);
    const server = message.guild;

    // get yesterday's Heardle details
    const previousSong = message.embeds[0].data.fields[0].value;
    const dayNumber = message.embeds[0].data.fields[1].value;

    const notificationRole = await message.guild.roles.cache.get(env.HEARDLE_ROLE_ID);

    // close and lock previous thread
    const lastThread = heardleChannel.threads.cache.last();
    if (lastThread && !lastThread.locked) {
      try {
        await lastThread.setLocked(true);
      } catch (err) {
        const logChannel = message.guild.channels.cache.get(env.LOGS_CHANNEL_ID);
        await sendMessageInLogChannel(null, err, logChannel);
      }
    }

    const heardleEmbed = new EmbedBuilder()
      .setTitle(`EDEN Heardle #${dayNumber} - New daily song!`)
      .setURL(HEARDLE_URL)
      .setDescription(`Yesterday's song was **${previousSong}**`)
      .setThumbnail(EDEN_LOGO)
      .setColor(Colors.HEARDLE)
      .setFooter({
        text: 'Share your results in the thread!',
        iconURL: server.iconURL({ dynamic: true })
      });

    const dailyMessage = await heardleChannel.send({ content: `${notificationRole}`, embeds: [heardleEmbed] });

    await dailyMessage.startThread({
      name: `EDEN Heardle #${dayNumber}`,
      autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
      reason: 'New daily Heardle song'
    });
  } else if (webhookEmbed.data.title.toLowerCase().includes('heardle') && webhookEmbed.data.description.toLowerCase().includes('error')) {
    const owner = message.guild.members.cache.get(message.guild.ownerId);

    await owner.send({ embeds: [webhookEmbed], content: 'Error with EDEN Heardle:' });
  }
}

function stylizeText(text) {
  const emojis = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x', '💚', '🙂', '🤠', '💫'];
  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

  return `${text.toLowerCase().slice(0, -1)} ${randomEmoji}`; // remove punctuation of last sentence in message
}

async function handleBotBaitMessage(message) {
  const modChannel = message.guild.channels.cache.get(env.MODERATORS_CHANNEL_ID);
  const member = message.member;

  await member.ban({ deleteMessageSeconds: 60 * 60 * 24, reason: 'Sent message in bot-bait channel' });

  const logEmbed = new EmbedBuilder()
    .setTitle(`[Bot Bait] ${member.displayName} was banned.`)
    .addFields([{ name: 'User ID: ', value: `${member.id}` }])
    .setColor(Colors.ERROR)
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setFooter({
      text: message.guild.name,
      iconURL: message.guild.iconURL({ dynamic: true })
    })
    .setTimestamp();
  await modChannel.send({ embeds: [logEmbed] });

  const owner = await message.guild.fetchOwner();

  const banEmbed = new EmbedBuilder()
    .setTitle(`You were banned from **${message.guild.name}**.`)
    .setDescription(`Sent message in bot-bait channel, please message ${owner.user} if this was a mistake`)
    .setColor(Colors.ERROR)
    .setFooter({
      text: message.guild.name,
      iconURL: message.guild.iconURL({ dynamic: true })
    })
    .setTimestamp();

  await member.send({ embeds: [banEmbed] });
}
