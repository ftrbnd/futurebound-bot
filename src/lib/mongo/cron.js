import { Client, EmbedBuilder } from 'discord.js';
import { CronJob } from 'cron';
import { getUsers } from './services/User.js';
import { getGiveaways } from './services/Giveaway.js';
import { env } from '../../utils/env.js';
import { Colors } from '../../utils/constants.js';
import { Document } from 'mongoose';
import { sendMessageInLogChannel } from '../../utils/error-handler.js';

const numberEndings = new Map([
  [13, 'th'],
  [12, 'th'],
  [11, 'th'],
  [3, 'rd'],
  [2, 'nd'],
  [1, 'st']
]);

/**
 * check birthdays + muted roles
 * @param {Client<boolean>} discordClient
 * @returns
 */
const checkUsers = async (discordClient) => {
  const today = new Date();

  const users = await getUsers();
  // is there a birthday today?
  if (users) {
    // console.log(`Checking for birthdays/mutes - today's date: ${today}`)
    const server = discordClient.guilds.cache.get(env.GUILD_ID);
    const modChannel = server.channels.cache.get(env.MODERATORS_CHANNEL_ID);
    if (!modChannel) return;

    users.forEach(async (user) => {
      if (user.birthday) {
        // not all users may have birthdays due to warn command
        if (
          today.getMonth() === user.birthday.getMonth() &&
          today.getDate() === user.birthday.getDate() &&
          today.getHours() === user.birthday.getHours() &&
          today.getMinutes() === user.birthday.getMinutes()
        ) {
          const age = today.getFullYear() - user.birthday.getFullYear();

          let ageSuffix;
          for (const [number, suffix] of numberEndings.entries()) {
            // every number ends with 'th' except for numbers that end in 1, 2, or 3
            if (`${age}`.endsWith(`${number}`)) {
              ageSuffix = suffix;
              break;
            } else {
              ageSuffix = 'th';
            }
          }

          let balloons = '';
          for (var i = 0; i < age; i++) {
            balloons += '🎈';
          }

          // var bdayDescription
          // if(age < 18) {
          //     bdayDescription = `It's ${user.username}'s birthday today!`
          // } else {
          //     bdayDescription = `It's ${user.username}'s ${age}${ageSuffix} birthday today!`
          // }
          // let bdayDescription = `It's ${user.username}'s birthday today! 🥳🎈🎉`

          const birthdayPerson = await server.members.fetch(user.discordId);
          const birthdayEmbed = new EmbedBuilder()
            .setTitle(`It's ${birthdayPerson.displayName}'s birthday today!`)
            .setDescription(' 🥳🎈🎉')
            .setColor(Colors.BIRTHDAY)
            .setThumbnail(birthdayPerson.user.displayAvatarURL({ dynamic: true }))
            .setFooter({
              text: `Use /birthday in #bots to set your own birthday`,
              iconURL: `${server.iconURL({ dynamic: true })}`
            });

          try {
            birthdayPerson.send({ content: 'happy birthday!! 🥳' });
          } catch (error) {
            console.log(`Failed to dm ${user.username}`);
            console.log(error);
          }

          const generalChannel = discordClient.channels.cache.get(env.GENERAL_CHANNEL_ID);
          generalChannel.send({ embeds: [birthdayEmbed] });
          console.log(`It's ${user.username}'s ${age}${ageSuffix} birthday today! - ${user.birthday}`);
        }
      }

      if (user.muteEnd) {
        // if a user has a muteEnd date != null
        if (today.getFullYear() === user.muteEnd.getFullYear() && today.getMonth() === user.muteEnd.getMonth() && today.getDate() === user.muteEnd.getDate()) {
          const userToUnmute = await server.members.fetch(user.discordId);
          if (!userToUnmute) {
            throw new Error(`Cannot unmute: ${user.username} is no longer in the server`);
          }

          try {
            userToUnmute.roles.set([]); // remove all roles - including Muted
          } catch {
            console.error();
          }

          const logEmbed = new EmbedBuilder()
            .setTitle(userToUnmute.displayName + ' was unmuted after a week.')
            .addFields([{ name: 'User ID: ', value: `${user.discordId}` }])
            .setColor(Colors.CONFIRM)
            .setFooter({
              text: server.name,
              iconURL: server.iconURL({ dynamic: true })
            })
            .setTimestamp();
          await modChannel.send({ embeds: [logEmbed] });

          // remove the muteEnd date in the database so it doesn't trigger again
          await updateUserMute(user, null, user.username);
        }
      }
    });
  }
};

/**
 * @param {Client<boolean>} discordClient
 * @returns
 */
const checkGiveaways = async (discordClient) => {
  const today = new Date();
  const giveaways = await getGiveaways();

  giveaways.forEach(async (giveaway) => {
    if (
      today.getFullYear() === giveaway.endDate.getFullYear() &&
      today.getMonth() === giveaway.endDate.getMonth() &&
      today.getDate() === giveaway.endDate.getDate() &&
      today.getHours() === giveaway.endDate.getHours() &&
      today.getMinutes() === giveaway.endDate.getMinutes()
    ) {
      await endGiveaway(discordClient, giveaway);
    }
  });
};

/**
 * @param {Client<boolean>} client
 * @param {Document<Giveaway>} giveaway
 * @returns
 */
export const endGiveaway = async (client, giveaway) => {
  if (giveaway.entries.length == 0) return console.log('No entries for this giveaway.');

  const server = client.guilds.cache.get(env.GUILD_ID);
  const giveawayChannel = server.channels.cache.get(giveaway.channelId);

  const winnerId = giveaway.entries[Math.floor(Math.random() * giveaway.entries.length)];
  console.log(`Winner's id of giveaway #${giveaway.id}: ${winnerId}`);

  const member = await server.members.fetch(winnerId);
  const winnerEmbed = new EmbedBuilder()
    .setAuthor({
      name: `${member.displayName} won the giveaway!`,
      iconURL: member.displayAvatarURL()
    })
    .addFields([{ name: 'Prize: ', value: giveaway.prize }])
    .setColor(Colors.GIVEAWAY)
    .setTimestamp();
  if (giveaway.imageURL) winnerEmbed.setThumbnail(giveaway.imageURL);

  await giveawayChannel.send({ embeds: [winnerEmbed] });
  try {
    await member.send({ content: 'Congrats on winning! A moderator will contact you shortly', embeds: [winnerEmbed] });
  } catch (error) {
    const logChannel = server.channels.cache.get(env.LOGS_CHANNEL_ID);
    sendMessageInLogChannel(null, error, logChannel);
  }
};

/**
 * @param {Client<boolean>} discordClient
 * @returns
 */
export const registerDatabaseChecks = async (discordClient) => {
  const usersJob = new CronJob('* * * * *', async () => checkUsers(discordClient), null, true, 'utc');
  const giveawaysJob = new CronJob('* * * * *', async () => checkGiveaways(discordClient), null, true, 'utc');

  return [usersJob, giveawaysJob];
};
