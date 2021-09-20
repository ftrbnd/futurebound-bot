const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')

const mongoose = require('mongoose')
const User = require('../schemas/UserSchema')

const { getTimeZones, rawTimeZones, timeZonesNames } = require("@vvo/tzdb")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('birthday')
		.setDescription('Set your birthday!')
        .addIntegerOption(option => 
            option.setName('month')
            .setDescription(`The month you were born`)
            .setRequired(true))
        .addIntegerOption(option => 
            option.setName('day')
            .setDescription(`The day you were born`)
            .setRequired(true))
        .addIntegerOption(option => 
            option.setName('year')
            .setDescription(`The year you were born`)
            .setRequired(true))
        .addStringOption(option => 
            option.setName('timezone')
            .setDescription(`The TZ database name (ex: Europe/London)`)
            .setRequired(true)),
		
	async execute(interaction) {
        console.log(`${interaction.user.username} used the /birthday command`)
        var monthOption = interaction.options._hoistedOptions[0].value
        var dayOption = interaction.options._hoistedOptions[1].value
        var yearOption = interaction.options._hoistedOptions[2].value
        const timezoneOption = interaction.options._hoistedOptions[3].value

        if(monthOption < 1 || 12 < monthOption) {
            const monthErrEmbed = new MessageEmbed()
                .setDescription('Please enter a valid month number (1-12)')
                .setColor(0xdf0000)

            return interaction.reply({ embeds: [monthErrEmbed], ephemeral: true })
        }

        if(dayOption < 1 || 31 < dayOption) {
            const dayErrEmbed = new MessageEmbed()
                .setDescription('Please enter a valid day number (1-31)')
                .setColor(0xdf0000)

            return interaction.reply({ embeds: [dayErrEmbed], ephemeral: true })
        }

        if(!timeZonesNames.includes(timezoneOption)) {
            const tzErrEmbed = new MessageEmbed()
                .setDescription('Please enter a valid TZ database name. More info can be found here: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List \nExample: **America/Los_Angeles**')
                .setColor(0xdf0000)

            return interaction.reply({ embeds: [tzErrEmbed], ephemeral: true })
        }

        // adjust their timezone to PST (Note: Heroku doesn't run on PST, but we're sticking to the variable names)
        const pstOffset = (getTimeZones().find(tz => tz.name === timezoneOption).rawOffsetInMinutes + 120) / 60 // hours behind or ahead of PST; 480 for PST/120 for Heroku's timezone
        // console.log(timezoneOption, "is", pstOffset, "hours ahead of PST")
        var midnightPST
        if(pstOffset != 0) {
            midnightPST = (24 - pstOffset) % 24
        } else {
            midnightPST = 0
        }
        // console.log(`Midnight there is at ${midnightPST}:00 PST`)

        // if it's a birthday, for example: May 25th EST at midnight
        // we want a 9PM PST time
        // but right now, although we get the time, the date is still the 25th
        // so they wouldn't get a notification until May 25th, 9PM PST - almost a full day later
        const monthDaysAmt = new Map() // if a birthday is on the 1st, we have to set the date to the 31st/30th/28th
        monthDaysAmt.set(1, '31')
        monthDaysAmt.set(2, '28')
        monthDaysAmt.set(3, '31')
        monthDaysAmt.set(4, '30')
        monthDaysAmt.set(5, '31')
        monthDaysAmt.set(6, '30')
        monthDaysAmt.set(7, '31')
        monthDaysAmt.set(8, '31')
        monthDaysAmt.set(9, '30')
        monthDaysAmt.set(10, '31')
        monthDaysAmt.set(11, '30')
        monthDaysAmt.set(12, '31')

        if(pstOffset > 0) { // if the timezone is ahead of PST
            if(((yearOption % 4 == 0) && (yearOption % 100 != 0)) || (yearOption % 400 == 0)) // leap year
                monthDaysAmt.set(2, '29')

            if(dayOption == 1) {
                monthOption-1==0 ? monthOption=12 : monthOption-=1 // if the month is January, set it to December, otherwise just move back one month
                monthOption==12 ? yearOption-=1 : yearOption=yearOption
                dayOption = monthDaysAmt.get(monthOption)
            } else {
                dayOption -= 1
            }
        }
        
        const birthdayAttempt = new Date(`${monthOption} ${dayOption} ${yearOption} ${midnightPST}:00`)

        logChannel = interaction.guild.channels.cache.get(process.env.LOGS_CHANNEL_ID)
        var birthdayEmbed = new MessageEmbed()
            .setColor(0x32ff25)
            .addField('Timezone', timezoneOption)
            .setFooter(interaction.guild.name, interaction.guild.iconURL({ dynamic : true }))

        var personalEmbed = new MessageEmbed()
            .setColor(0x32ff25)
            .addField('Timezone', timezoneOption)
            .setFooter(interaction.guild.name, interaction.guild.iconURL({ dynamic : true }))

        const theirBirthday = new Date(`${interaction.options._hoistedOptions[0].value} ${interaction.options._hoistedOptions[1].value} ${interaction.options._hoistedOptions[2].value}`)
        
        User.findOne({ discordId: interaction.user.id }, { upsert: true }, (err, data) => {
            if(err) return console.log(err)

            if(!data) { // if the user isn't already in the database, add their data
                const newUser = User.create({
                    discordId: interaction.user.id,
                    username: interaction.user.username,
                    birthday: birthdayAttempt,
                    timezone: timezoneOption
                }).catch(err => console.log(err))
                
                console.log(`${interaction.user.username} set their birthday to ${theirBirthday.toLocaleDateString()}`)
                
                birthdayEmbed.setAuthor(`${interaction.user.username} set their birthday to ${theirBirthday.toLocaleDateString()}`, interaction.user.displayAvatarURL({ dynamic : true }))
                logChannel.send({ embeds: [birthdayEmbed] })

                personalEmbed.setAuthor(`You have set your birthday to ${theirBirthday.toLocaleDateString()}`)
                return interaction.reply({ embeds: [personalEmbed], ephemeral: true })

            } else { // if they already were in the database, simply update and save
                data.username = interaction.user.username
                data.birthday = birthdayAttempt
                data.timezone = timezoneOption
                data.save()

                console.log(`${interaction.user.username} updated their birthday to ${theirBirthday.toLocaleDateString()}`)

                birthdayEmbed.setAuthor(`${interaction.user.username} updated their birthday to ${theirBirthday.toLocaleDateString()}`, interaction.user.displayAvatarURL({ dynamic : true }))
                logChannel.send({ embeds: [birthdayEmbed] })

                personalEmbed.setAuthor(`You have updated your birthday to ${theirBirthday.toLocaleDateString()}`)
                return interaction.reply({ embeds: [personalEmbed], ephemeral: true })
            }
        })
	},
}