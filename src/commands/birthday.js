import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { getTimeZones, timeZonesNames } from '@vvo/tzdb';
import { createUser, deleteUserBirthday, getUser, updateUserBirthday } from '../lib/mongo/services/User.js';
import { env } from '../utils/env.js';
import { Colors } from '../utils/constants.js';

export const data = new SlashCommandBuilder()
  .setName('birthday')
  .setDescription('Manage your birthday!')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('set')
      .setDescription('Set or update your birthday')
      .addIntegerOption((option) => option.setName('month').setDescription(`The month you were born`).setMinValue(1).setMaxValue(12).setRequired(true))
      .addIntegerOption((option) => option.setName('day').setDescription(`The day you were born`).setMinValue(1).setMaxValue(31).setRequired(true))
      .addIntegerOption((option) =>
        option
          .setName('year')
          .setDescription(`The year you were born`)
          .setMinValue(1900)
          .setMaxValue(new Date().getFullYear() - 1)
          .setRequired(true)
      )
      .addStringOption((option) => option.setName('timezone').setDescription(`The TZ database name (ex: Europe/London)`).setRequired(true))
  )
  .addSubcommand((subcommand) => subcommand.setName('remove').setDescription('Remove your birthday'));

export async function execute(interaction) {
  if (interaction.options.getSubcommand() === 'set') {
    let monthOption = interaction.options.getInteger('month');
    let dayOption = interaction.options.getInteger('day');
    let yearOption = interaction.options.getInteger('year');
    const timezoneOption = interaction.options.getString('timezone');

    if (!timeZonesNames.includes(timezoneOption)) {
      throw new Error('Please enter a valid TZ database name. More info can be found here: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List \nExample: **America/Los_Angeles**');
    }

    // adjust their timezone to PST (Note: Heroku doesn't run on PST, but we're sticking to the variable names)
    const pstOffset = (getTimeZones().find((tz) => tz.name === timezoneOption).rawOffsetInMinutes + 60) / 60; // hours behind or ahead of PST; add 480 after rawOffsetInMinutes before dividing by 60 for PST/60 for Heroku's timezone
    let midnightPST = pstOffset != 0 ? (24 - pstOffset) % 24 : 0;

    // if it's a birthday, for example: May 25th EST at midnight
    // we want a 9PM PST time
    // but right now, although we get the time, the date is still the 25th
    // so they wouldn't get a notification until May 25th, 9PM PST - almost a full day later
    const monthDaysAmt = new Map(); // if a birthday is on the 1st, we have to set the date to the 31st/30th/28th
    monthDaysAmt.set(1, '31');
    monthDaysAmt.set(2, '28');
    monthDaysAmt.set(3, '31');
    monthDaysAmt.set(4, '30');
    monthDaysAmt.set(5, '31');
    monthDaysAmt.set(6, '30');
    monthDaysAmt.set(7, '31');
    monthDaysAmt.set(8, '31');
    monthDaysAmt.set(9, '30');
    monthDaysAmt.set(10, '31');
    monthDaysAmt.set(11, '30');
    monthDaysAmt.set(12, '31');

    if (pstOffset > 0) {
      // if the timezone is ahead of PST
      if ((yearOption % 4 == 0 && yearOption % 100 != 0) || yearOption % 400 == 0)
        // leap year
        monthDaysAmt.set(2, '29');

      if (dayOption == 1) {
        monthOption = monthOption - 1 == 0 ? (monthOption = 12) : (monthOption -= 1); // if the month is January, set it to December, otherwise just move back one month
        yearOption = monthOption == 12 ? yearOption - 1 : yearOption;
        dayOption = monthDaysAmt.get(monthOption);
      } else {
        dayOption -= 1;
      }
    }

    const birthdayAttempt = new Date(`${monthOption} ${dayOption} ${yearOption} ${midnightPST}:00`);

    const logChannel = interaction.guild.channels.cache.get(env.LOGS_CHANNEL_ID);
    const birthdayEmbed = new EmbedBuilder()
      .setColor(Colors.CONFIRM)
      .addFields([{ name: 'Timezone', value: timezoneOption }])
      .setFooter({
        text: interaction.guild.name,
        iconURL: interaction.guild.iconURL({ dynamic: true })
      });

    const personalEmbed = new EmbedBuilder()
      .setColor(Colors.CONFIRM)
      .addFields([{ name: 'Timezone', value: timezoneOption }])
      .setFooter({
        text: interaction.guild.name,
        iconURL: interaction.guild.iconURL({ dynamic: true })
      });

    const theirBirthday = new Date(`${monthOption} ${dayOption} ${yearOption}`);

    const user = await getUser({ discordId: interaction.user.id });
    if (!user) {
      // if the user isn't already in the database, add their data
      await createUser({
        discordId: interaction.user.id,
        username: interaction.user.username,
        birthday: birthdayAttempt,
        timezone: timezoneOption
      });

      console.log(`${interaction.user.username} set their birthday to ${theirBirthday.toLocaleDateString()}: ${birthdayAttempt}`);

      birthdayEmbed.setAuthor({
        name: `${interaction.user.username} set their birthday to ${theirBirthday.toLocaleDateString()}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      });
      await logChannel.send({ embeds: [birthdayEmbed] });

      personalEmbed.setAuthor({
        name: `You have set your birthday to ${theirBirthday.toLocaleDateString()}`
      });
      await interaction.reply({ embeds: [personalEmbed], ephemeral: true });
    } else {
      // if they already were in the database, simply update and save
      await updateUserBirthday(user, interaction.user.username, birthdayAttempt, timezoneOption);

      console.log(`${interaction.user.username} updated their birthday to ${theirBirthday.toLocaleDateString()}: ${birthdayAttempt}`);

      birthdayEmbed.setAuthor({
        name: `${interaction.user.username} updated their birthday to ${theirBirthday.toLocaleDateString()}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      });
      await logChannel.send({ embeds: [birthdayEmbed] });

      personalEmbed.setAuthor({
        name: `You have updated your birthday to ${theirBirthday.toLocaleDateString()}`
      });
      await interaction.reply({ embeds: [personalEmbed], ephemeral: true });
    }
  } else if (interaction.options.getSubcommand() === 'remove') {
    const user = await getUser({ discordId: interaction.user.id });

    if (!user.birthday) throw new Error('You do not have a birthday set.');

    await deleteUserBirthday(user);

    const embed = new EmbedBuilder().setDescription('Your birthday was successfully removed.').setColor(Colors.CONFIRM);
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
