require('dotenv').config();

const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('timeout')
		.setDescription('Timeout a user for a specified amount of time')
        .addUserOption(option =>
            option.setName('user')
            .setDescription('The user to be timed out')
            .setRequired(true))
        .addIntegerOption(option => 
            option.setName('duration')
            .setDescription('Timeout duration')
            .setRequired(true)
            .addChoices(
                { name: '1 minute', value: 60000 },
                { name: '5 minutes', value: 300000 },
                { name: '10 minutes', value: 600000 },
                { name: '1 hour', value: 3600000  },
                { name: '1 day', value: 86400000  },
                { name: '1 week', value: 604800000 },
            ))
        .addStringOption(option => 
            option.setName('reason')
            .setDescription('The reason for timeout')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles), // any permission that the Helper role has access to should work
		
	async execute(interaction) {
        if(interaction.member.roles.cache.has(process.env.MODERATORS_ROLE_ID) || interaction.member.roles.cache.has(process.env.HELPER_ROLE_ID)) { // Moderator and Helper roles
            const userToTimeout = interaction.guild.members.cache.get(interaction.options.getUser('user').id);
            const duration = interaction.options.getInteger('duration'); // milliseconds
            const reasonForTimeout = interaction.options.getString('reason');
            
            const modChannel = interaction.guild.channels.cache.get(process.env.MODERATORS_CHANNEL_ID);
            if(!modChannel) return;

            try {
                userToTimeout.timeout(duration, reasonForTimeout);
            } catch(err) {
                const errEmbed = new EmbedBuilder()
                    .setDescription('Error in timing out user.')
                    .setColor('0xdf0000');
                interaction.reply({ embeds: [errEmbed] });
                return console.log(err);
            }

            const millisecondsToDuration = new Map([
                [60000, '1 minute'],
                [300000, '5 minutes'],
                [600000, '10 minutes'],
                [3600000, '1 hour'],
                [86400000, '1 day'],
                [604800000, '1 week']
            ]);

            const logEmbed = new EmbedBuilder()
                .setTitle(userToTimeout.user.tag + ` was timed out for ${millisecondsToDuration.get(duration)}.`)
                .addFields([
                    { name: 'User ID: ', value: `${userToTimeout.id}`},
                    { name: 'By: ', value: `${interaction.user}`},
                    { name: 'Reason: ', value: reasonForTimeout},
                ])
                .setColor('0xdf0000')
                .setThumbnail(userToTimeout.displayAvatarURL({ dynamic : true }))
                .setFooter({
                    text: interaction.guild.name, 
                    iconURL: interaction.guild.iconURL({ dynamic : true })
                })
                .setTimestamp();
            modChannel.send({ embeds: [logEmbed] });

            const timeoutEmbed = new EmbedBuilder()
                .setTitle(`You were timed out from **${interaction.guild.name}** for ${millisecondsToDuration.get(duration)}.`)
                .setDescription(reasonForTimeout)
                .setColor('0xdf0000')
                .setFooter({
                    text: interaction.guild.name, 
                    iconURL: interaction.guild.iconURL({ dynamic : true })
                })
                .setTimestamp();
            
            try {
                await userToTimeout.send({ embeds: [timeoutEmbed] });
            } catch(err) {
                const errEmbed = new EmbedBuilder()
                    .setDescription('Error in sending message to user.')
                    .setColor('0xdf0000');
                interaction.reply({ embeds: [errEmbed] });
                console.log(err);
            }
                
            const timedOutEmbed = new EmbedBuilder()
                .setDescription(`${userToTimeout} was timed out for ${millisecondsToDuration.get(duration)}.`)
                .setColor('0x32ff25');
            interaction.reply({ embeds: [timedOutEmbed] });

        } else {
            const permsEmbed = new EmbedBuilder()
                .setDescription('You do not have permission to use this command.')
                .setColor('0xdf0000');
            return interaction.reply({ embeds: [permsEmbed], ephemeral: true });
        }
	},
}