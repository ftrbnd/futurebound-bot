const { EmbedBuilder, SlashCommandBuilder, ChannelType } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Play music using YouTube, Spotify, or SoundCloud')
        .addStringOption(option => 
            option.setName('song')
            .setDescription('Search query or YouTube/Spotify/SoundCloud links')
            .setRequired(true)),
		
	async execute(interaction) {
        const getAllowedRoleId = require('../helperFunctions/getAllowedRoleId');
        const allowedRoleId = await getAllowedRoleId.execute(interaction);
        if (!interaction.member._roles.includes(allowedRoleId) && allowedRoleId != interaction.guild.roles.everyone.id) {
            const errEmbed = new EmbedBuilder()
                .setDescription(`You do not have permission to use music commands right now!`)
                .setColor('df0000');
            return interaction.reply({ embeds: [errEmbed] });
        }

        const voiceChannel = interaction.member.voice.channel;
        if(!voiceChannel) {
            const errEmbed = new EmbedBuilder()
                .setDescription(`You must join a voice channel!`)
                .setColor('df0000');
            return interaction.reply({ embeds: [errEmbed] });
        }

        const chosenSong = interaction.options.getString('song');
    
        await interaction.deferReply({ ephemeral: true });

        await interaction.client.DisTube.play(voiceChannel, chosenSong, {
            member: interaction.member,
            textChannel: interaction.channel,
        }).catch(err => {
            console.log(err);
            const errEmbed = new EmbedBuilder()
                .setDescription(`An error occurred in /play.`)
                .setColor('df0000');
            return interaction.reply({ embeds: [errEmbed] });
        })

        if (voiceChannel.type === ChannelType.GuildStageVoice) {
            interaction.guild.members.me.voice.setSuppressed(false); // set bot as Stage speaker
        }

        const confirmEmbed = new EmbedBuilder()
            .setDescription('👍')
            .setColor(process.env.MUSIC_COLOR);
        await interaction.editReply({ embeds: [confirmEmbed] });
	},
}