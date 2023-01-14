const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('volume')
		.setDescription("Adjust the bot's volume for everyone")
        .addNumberOption(option => 
            option.setName('percent')
            .setDescription('The volume percentage')
            .setRequired(true)),
		
	async execute(interaction) {
        const voiceChannel = interaction.client.DisTube.voices.get(interaction.member.voice.channel);
        const percent = interaction.options.getNumber('percent');

        if (percent < 0 || percent > 200) {
            const errEmbed = new EmbedBuilder()
                .setDescription(`Volume must be between 0 and 200`)
                .setColor('0xdf0000');
            return interaction.reply({ embeds: [errEmbed] });
        }

        if(voiceChannel) {
            interaction.client.DisTube.setVolume(interaction.guild, percent);

            const volumeEmbed = new EmbedBuilder()
                .setDescription(`Adjusted volume to **${percent}%**`)
                .setColor(process.env.MUSIC_COLOR);
    
            interaction.reply({ embeds: [volumeEmbed] });

        } else {
            const errEmbed = new EmbedBuilder()
                .setDescription(`Not in a voice channel`)
                .setColor('0xdf0000');
            interaction.reply({ embeds: [errEmbed] });
        }
	},
}