const lyricsFinder = require('lyrics-finder')
require('dotenv').config()

const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('guessthesong')
		.setDescription('Guess the song within 15 seconds!'),
		
	async execute(interaction) {
        const artist = "EDEN"
        // Can't find the lyrics to: wings, ????, Peaked, cant help
        const songs = ['End Credits', 'Gravity', 'Nocturne', 'Interlude', 'Wake Up', 
            'catch me if you can', 'Billie Jean', 'sex', 'drugs', 'and', 'rock + roll', 
            'Fumes', 'XO', 'Circles', 'wrong', 'take care', 'start//end', 'icarus', 
            'lost//found', 'crash', 'gold', 'forever//over', 'float', 'wonder', 
            'love; not wrong (brave)', 'falling in reverse', 'about time', 'all you need is love', 
            'nowhere else', '909', 'good morning', 'hertz', 'static', 'projector', 
            'love, death, distraction', 'how to sleep', 'calm down', 'just saying', 'fomo', 
            'so far so good', 'isohel', 'tides', 'rushing', '$treams', '2020', 'untitled', 
            'Cold Feet', 'Stingray']

        const randomSong = songs[Math.floor(Math.random() * songs.length)]

        // log the command
        console.log(`guessthesong command was used - Song: ${randomSong}`);

        var line = ''
        await (async function(artist, randomSong) {
            let lyrics = await lyricsFinder(artist, randomSong) || "Not Found!"
            if(lyrics !== "Not Found!") {
                const onlyLyrics = lyrics.split('Source:')[0] // get rid of all unnecessary text after 'Source:'
                
                lines = onlyLyrics.split("\n") // split into an array containing each line
                lines = lines.filter(item => item) // get rid of empty lines ''

                randomIndex = Math.floor(Math.random() * lines.length)
                if(randomIndex == lines.length - 1) // if the last line is selected, move back one line so we are able to select 2 lines
                    randomIndex--
                
                line = lines[randomIndex] + "\n" + lines[randomIndex + 1]

                // embed that will show the song lyric
                const guessTheSongEmbed = new MessageEmbed()
                    .setTitle(`Guess The Song`)
                    .setThumbnail('https://i.imgur.com/rQmm1FM.png') // EDEN's logo
                    .setColor(0xfa57c1)
                    .setDescription(`${line}`)
                    .setFooter(interaction.guild.name, interaction.guild.iconURL({ dynamic : true}))

                interaction.reply({ embeds: [guessTheSongEmbed] })

                const filter = m => m.content.toLowerCase().includes(randomSong.toLowerCase())
                const collector = interaction.channel.createMessageCollector({ filter, time: 15000 }) // collector stops checking after 15 seconds

                collector.on('collect', m => {
                    const winnerEmbed = new MessageEmbed()
                        .setTitle(m.author.username + ' guessed the song!')
                        .addField('Song', randomSong)
                        .setDescription(`${line}`)
                        .setThumbnail(m.author.displayAvatarURL({ dynamic : true}))
                        .setColor(0x32ff25)
                        .setFooter(m.guild.name, m.guild.iconURL({ dynamic : true}) )

                    interaction.followUp({ embeds: [winnerEmbed] })
                    collector.stop()
                })

                collector.on('end', collected => {
                    if(collected.size == 0) { // if no correct song was guessed (collected by the MessageCollector)
                        const timeOutEmbed = new MessageEmbed()
                            .setTitle('Nobody guessed the song within 15 seconds.')
                            .addField('Song', randomSong)
                            .setDescription(`${line}`)
                            .setColor(0xdf0000)
                            .setFooter(interaction.guild.name, interaction.guild.iconURL({ dynamic : true}) )
                        
                        interaction.followUp({ embeds: [timeOutEmbed] })
                    }
                })
            } else {
                console.log(`Could not find the lyrics to ${randomSong}`)

                const giosalad = interaction.guild.members.cache.get(process.env.GIOSALAD_ID) // my account

                const couldntFindEmbed = new MessageEmbed()
                    .setTitle(`Could not find the lyrics to ${randomSong}, please try again!`)
                    .setColor(0xdf0000)
                    .setDescription(`${line}`)
                    .setFooter(interaction.guild.name, interaction.guild.iconURL({ dynamic : true}))

                giosalad.send(`Couldn't find the lyrics to ${randomSong}`)
                interaction.reply({ embeds: [couldntFindEmbed], ephemeral: true })
            }
        })(artist, randomSong)
	},
}