const { EmbedBuilder } = require('discord.js')
const MusicPermission = require('../schemas/MusicPermissionSchema');

module.exports = {
    async execute(interaction) {
        const roleData = await MusicPermission.find({}, (err, data) => {
            if (err) {
                const errEmbed = new EmbedBuilder()
                    .setDescription('An error occured.')
                    .setColor('df0000');
                interaction.reply({ embeds: [errEmbed] });
                return console.log(err);
            }
    
            if (!data) {
                const errEmbed = new EmbedBuilder()
                    .setDescription('No data found.')
                    .setColor('df0000');
                return interaction.reply({ embeds: [errEmbed] });
    
            } else {
                return data;
            }
        }).clone();
    
        return roleData[0].roleId;
    }
}