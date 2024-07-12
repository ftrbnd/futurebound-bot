const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

const User = require('../schemas/UserSchema');
const Giveaway = require('../schemas/GiveawaySchema');
const { EmbedBuilder } = require('discord.js');

const numberEndings = new Map([
  [13, 'th'],
  [12, 'th'],
  [11, 'th'],
  [3, 'rd'],
  [2, 'nd'],
  [1, 'st']
]);

const registerDatabaseChecks = async (client) => {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then((m) => {
      console.log(`[Mongo] Connected to ${m.connections[0].name}`);
    })
    .catch((err) => console.log(err));

  setInterval(async () => {
    const today = new Date();

    const users = await User.find({});
    // is there a birthday today?
    if (users) {
      // console.log(`Checking for birthdays/mutes - today's date: ${today}`)
      const server = client.guilds.cache.get(process.env.GUILD_ID);
      const modChannel = server.channels.cache.get(process.env.MODERATORS_CHANNEL_ID);
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

            const birthdayPerson = server.members
              .fetch(user.discordId)
              .then((birthdayPerson) => {
                const birthdayEmbed = new EmbedBuilder()
                  .setTitle(`It's ${birthdayPerson.displayName}'s birthday today!`)
                  .setDescription(' 🥳🎈🎉')
                  .setColor('ffffc5')
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

                const generalChannel = client.channels.cache.get(process.env.GENERAL_CHANNEL_ID);
                generalChannel.send({ embeds: [birthdayEmbed] });
                console.log(`It's ${user.username}'s ${age}${ageSuffix} birthday today! - ${user.birthday}`);
              })
              .catch(console.error);
          }
        }

        if (user.muteEnd) {
          // if a user has a muteEnd date != null
          if (today.getFullYear() === user.muteEnd.getFullYear() && today.getMonth() === user.muteEnd.getMonth() && today.getDate() === user.muteEnd.getDate()) {
            const userToUnmute = await server.members.fetch(user.discordId);

            try {
              userToUnmute.roles.set([]); // remove all roles - including Muted
            } catch {
              console.error();
            }

            const logEmbed = new EmbedBuilder()
              .setTitle(userToUnmute.displayName + ' was unmuted after a week.')
              .addFields([{ name: 'User ID: ', value: `${user.discordId}` }])
              .setColor(process.env.CONFIRM_COLOR)
              .setFooter({
                text: server.name,
                iconURL: server.iconURL({ dynamic: true })
              })
              .setTimestamp();
            await modChannel.send({ embeds: [logEmbed] });

            // remove the muteEnd date in the database so it doesn't trigger again
            user.muteEnd = null;
            await user.save();
          }
        }
      });
    }

    const giveaways = await Giveaway.find({});
    if (giveaways) {
      giveaways.forEach(async (giveaway) => {
        if (
          today.getFullYear() === giveaway.endDate.getFullYear() &&
          today.getMonth() === giveaway.endDate.getMonth() &&
          today.getDate() === giveaway.endDate.getDate() &&
          today.getHours() === giveaway.endDate.getHours() &&
          today.getMinutes() === giveaway.endDate.getMinutes()
        ) {
          if (giveaway.entries.length == 0) return console.log('No entries for this giveaway.');

          const server = client.guilds.cache.get(process.env.GUILD_ID);
          const giveawayChannel = server.channels.cache.get(process.env.GIVEAWAY_CHANNEL_ID);

          const winnerId = giveaway.entries[Math.floor(Math.random() * giveaway.entries.length)];
          console.log(`Winner's id of giveaway #${giveaway.id}: ${winnerId}`);

          const member = await server.members.fetch(winnerId);
          const winnerEmbed = new EmbedBuilder()
            .setAuthor({
              name: `${member.displayName} won the giveaway!`,
              iconURL: member.displayAvatarURL()
            })
            .addFields([{ name: 'Prize: ', value: giveaway.prize }])
            .setColor(process.env.GIVEAWAY_COLOR)
            .setTimestamp();
          if (giveaway.imageURL) winnerEmbed.setThumbnail(giveaway.imageURL);

          await giveawayChannel.send({ embeds: [winnerEmbed] });
          try {
            await member.send({ content: 'Congrats on winning! A moderator will contact you shortly', embeds: [winnerEmbed] });
          } catch (e) {
            console.log(e);
          }
        }
      });
    }
  }, 60000); // run this every minute
};

module.exports = {
  registerDatabaseChecks
};
