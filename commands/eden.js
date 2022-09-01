var imgur = require('imgur')

const { SlashCommandBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('eden')
		.setDescription('Get a random picture of EDEN'),
		
	async execute(interaction) {
        var edenAlbumOne = '3Zh414x'
        var edenAlbumTwo = 'DZ913Hd'
        var edenAlbumThree = 'PUfyYtt'

        var edenImages = []

        imgur.getAlbumInfo(edenAlbumOne)
            .then((json) => {
                json.images.forEach(image => {
                    edenImages.push(image.link)
                })
            })
            .catch((err) => {
                console.error(err.message)
            })

        imgur.getAlbumInfo(edenAlbumTwo)
            .then((json) => {
                json.images.forEach(image => {
                    edenImages.push(image.link)
                })
            })
        .catch((err) => {
            console.error(err.message)
        })

        imgur.getAlbumInfo(edenAlbumThree)
            .then((json) => {
                json.images.forEach(image => {
                    edenImages.push(image.link)
                })

                interaction.reply({ files: [`${edenImages[Math.floor(Math.random()*(edenImages.length))]}`] })
            })
            .catch((err) => {
                console.error(err.message)
            })
	},
}