require('dotenv').config()

const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('survivor')
		.setDescription('Start a new round of Survivor!')
        .addChannelOption(option =>
            option.setName('channel')
            .setDescription('The channel to send the Survivor message')
            .setRequired(true))
            .addStringOption(option => 
                option.setName('album')
                .setDescription('The name of the album/ep')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('songs')
            .setDescription('The names of the songs, separated by commas (02:09, End Credits, Gravity)')
            .setRequired(true)),
		
	async execute(interaction) {
        if(interaction.member.roles.cache.has(process.env.MODERATORS_ROLE_ID)) { // Moderator role
            // const emojiMap = new Map()
            // emojiMap.set('sex', 'sex')
            // emojiMap.set('drugs', 'drugs')
            // emojiMap.set('and', 'and')
            // emojiMap.set('rockandroll', 'rock + roll')
            // emojiMap.set('fumes_gnash', 'Fumes (feat. gnash)')
            // emojiMap.set('xo', 'XO')
            // emojiMap.set('circles', 'Circles')
            
            const targetChannel = interaction.options._hoistedOptions[0].channel
            const albumName = interaction.options._hoistedOptions[1].value
            const songNames = interaction.options._hoistedOptions[2].value

            if(!songNames.includes(',')) {
                const commaEmbed = new MessageEmbed()
                    .setDescription(`Please separate the song names with commas.`)
                    .setColor(0xdf0000)
                return interaction.reply({ embeds: [commaEmbed], ephemeral: true })
            }

            try {
                // separate song names into an array
                var songNamesList = songNames.split(',')
                songNamesList.forEach((songName, index) => {
                    songNamesList[index] = songName.trim()
                })

                const survivorEmbed = new MessageEmbed()
                    .setTitle(`Survivor - ${albumName}`)
                    .setDescription(`${songNamesList.join("\n\n")}`)
                    // .setColor(0xb8ffe4) // each album has a color
                    .setFooter(interaction.guild.name, interaction.guild.iconURL({ dynamic : true}) )
                targetChannel.send({ embeds: [survivorEmbed] })

                const confirmEmbed = new MessageEmbed()
                    .setDescription(`New round of **${albumName} Survivor** sent in ${targetChannel}`)
                // .setColor(0x32ff25) // different color for each album
                interaction.reply({ embeds: [confirmEmbed] })

            } catch(error) {
                console.log(error)
                const errorEmbed = new MessageEmbed()
                    .setDescription('Could not find the emojis for the songs.')
                    .setColor(0xdf0000) // different color for each album
                interaction.reply({ embeds: [errorEmbed], ephemeral: true })
            }
        } else {
            const permsEmbed = new MessageEmbed()
                .setDescription('You do not have permission to use this command.')
                .setColor(0xdf0000)
            return interaction.reply({ embeds: [permsEmbed], ephemeral: true })
        }
	},
}