const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')

const mongoose = require('mongoose')
const User = require('../schemas/UserSchema')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('birthday')
		.setDescription('Set your birthday!')
        .addStringOption(option => 
            option.setName('month')
            .setDescription(`The month you were born`)
            .setRequired(true))
        .addStringOption(option => 
            option.setName('day')
            .setDescription(`The day you were born`)
            .setRequired(true))
        .addStringOption(option => 
            option.setName('year')
            .setDescription(`The year you were born`)
            .setRequired(true))
        .addStringOption(option => 
            option.setName('timezone')
            .setDescription(`The abbreviation of your timezone (PST, EST, GMT, etc.)`)
            .setRequired(true)),
		
	async execute(interaction) {
        var monthOption = interaction.options._hoistedOptions[0].value.charAt(0).toUpperCase() + interaction.options._hoistedOptions[0].value.slice(1)
        const dayOption = interaction.options._hoistedOptions[1].value
        const yearOption = interaction.options._hoistedOptions[2].value
        const timezoneOption = interaction.options._hoistedOptions[3].value.toUpperCase()

        logChannel = interaction.guild.channels.cache.get(process.env.LOGS_CHANNEL_ID)
        var birthdayEmbed = new MessageEmbed()
            .setColor(0x32ff25)
            .addField('Timezone', timezoneOption)
            .setFooter(interaction.guild.name, interaction.guild.iconURL({ dynamic : true }))

        var personalEmbed = new MessageEmbed()
            .setColor(0x32ff25)
            .addField('Timezone', timezoneOption)
            .setFooter(interaction.guild.name, interaction.guild.iconURL({ dynamic : true }))

        const birthdayAttempt = new Date(`${monthOption} ${dayOption} ${yearOption}`)

        User.findOne({ discordId: interaction.user.id }, { upsert: true }, (err, data) => {
            if(err) return console.log(err)

            if(!data) { // if the user isn't already in the database, add their data
                const newUser = User.create({
                    discordId: interaction.user.id,
                    username: interaction.user.username,
                    birthday: birthdayAttempt,
                    timezone: timezoneOption
                }).catch(err => console.log(err))
                
                birthdayEmbed.setAuthor(`${interaction.user.username} set their birthday to ${monthOption} ${dayOption}, ${yearOption}`, interaction.user.displayAvatarURL({ dynamic : true }))
                logChannel.send({ embeds: [birthdayEmbed] })

                personalEmbed.setAuthor(`You have set your birthday to ${monthOption} ${dayOption}, ${yearOption}`)
                return interaction.reply({ embeds: [personalEmbed], ephemeral: true })

            } else { // if they already were in the database, simply update and save
                data.username = interaction.user.username
                data.birthday = birthdayAttempt
                data.timezone = timezoneOption
                data.save()

                birthdayEmbed.setAuthor(`${interaction.user.username} updated their birthday to ${monthOption} ${dayOption}, ${yearOption}`, interaction.user.displayAvatarURL({ dynamic : true }))
                logChannel.send({ embeds: [birthdayEmbed] })

                personalEmbed.setAuthor(`You have updated your birthday to ${monthOption} ${dayOption}, ${yearOption}`)
                return interaction.reply({ embeds: [personalEmbed], ephemeral: true })
            }
        })
	},
}