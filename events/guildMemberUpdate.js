require('dotenv').config();
const { EmbedBuilder } = require('discord.js');

module.exports = {
	name: 'guildMemberUpdate',
	async execute(oldMember, newMember) {        
        const modChannel = newMember.guild.channels.cache.get(process.env.MODERATORS_CHANNEL_ID);
		if(!modChannel) return;

        if(oldMember.communicationDisabledUntil === null && newMember.communicationDisabledUntil !== null) { // a user is timed out
            const timeoutEmbed = new EmbedBuilder()
                .setTitle(`${newMember.user.username} was timed out.`)
                .addFields([
                    { name: 'User: ', value: `${newMember.user}`},
                    { name: 'ID: ', value: `${newMember.user.id}`},
                ])
                .setColor('0xdf0000')
                .setThumbnail(newMember.user.displayAvatarURL({ dynamic : true}))
                .setFooter({
                    text: newMember.guild.name, 
                    iconURL: newMember.guild.iconURL({ dynamic : true})
                })
                .setTimestamp();

            modChannel.send({ embeds: [timeoutEmbed] });

        } else if (oldMember.communicationDisabledUntil !== null && newMember.communicationDisabledUntil === null) { // a timeout is removed
            const timeoutEmbed = new EmbedBuilder()
                .setTitle(`${newMember.user.username}'s timeout was removed.`)
                .addFields([
                    { name: 'User: ', value: `${newMember.user}`},
                    { name: 'ID: ', value: `${newMember.user.id}`},
                ])
                .setColor('0x32ff25')
                .setThumbnail(newMember.user.displayAvatarURL({ dynamic : true}))
                .setFooter({
                    text: newMember.guild.name, 
                    iconURL: newMember.guild.iconURL({ dynamic : true})
                })
                .setTimestamp();

            modChannel.send({ embeds: [timeoutEmbed] });
        }
	},
}