require('dotenv').config();
const { EmbedBuilder } = require('discord.js');

module.exports = {
	name: 'error',
	async execute(channel, error) {
        console.error(error);
        
        const errEmbed = new EmbedBuilder()
            .setDescription(`An error occurred.`)
            .setColor(process.env.ERROR_COLOR);

        channel.send({ embeds: [errEmbed]});
	},
}