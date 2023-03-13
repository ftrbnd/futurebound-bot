require('dotenv').config();
const { EmbedBuilder } = require('discord.js');

module.exports = {
	name: 'error',
	async execute(channel, error) {
        console.error(error);
        
        const errEmbed = new EmbedBuilder()
            .setDescription(`An error occurred.`)
            .setColor('df0000');

        channel.send({ embeds: [errEmbed]});
	},
}