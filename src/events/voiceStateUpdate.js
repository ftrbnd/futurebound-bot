import { EmbedBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { env } from '../utils/env.js';
import { Colors } from '../utils/constants.js';
import { sendMessageInLogChannel } from '../utils/error-handler.js';

export const name = 'voiceStateUpdate';
export async function execute(oldState, newState) {
  if (newState.member.user.bot) return; // ignore bots

  const logChannel = oldState.guild.channels.cache.get(env.LOGS_CHANNEL_ID);
  if (!logChannel) return;

  try {
    const voiceChat = oldState.guild.channels.cache.get(env.VOICE_CHAT_CHANNEL_ID);
    if (!voiceChat) return;

    if (newState.channel !== null && newState.channel.id === env.JOIN_TO_CREATE_CHANNEL_ID) {
      // if they join the 'join to create' vc
      const parentCategory = newState.channel.parent;

      const customVoiceChannel = await newState.guild.channels.create({
        name: `${newState.member.displayName}'s channel`,
        type: ChannelType.GuildVoice,
        parent: parentCategory,
        PermissionOverwrites: [
          {
            id: newState.member.id,
            allow: [PermissionFlagsBits.ManageChannels]
          }
        ]
      });
      await newState.setChannel(customVoiceChannel);

      const helloEmbed = new EmbedBuilder()
        .setDescription(
          'You just created your own voice channel! Feel free to edit the channel name to let others know what your channel is about. \nNOTE: Make sure you have **Two-Factor Authentication** enabled on your Discord account.'
        )
        .setColor(Colors.CONFIRM)
        .setFooter({
          text: newState.guild.name,
          iconURL: newState.guild.iconURL({ dynamic: true })
        });

      const message = await voiceChat.send({ content: `${newState.member}`, embeds: [helloEmbed] });

      setTimeout(() => message.delete(), 60000); // delete after one minute

      const vcUpdateEmbed = new EmbedBuilder()
        .setDescription(`${newState.member.user.tag} created **${customVoiceChannel.name}**`)
        .setColor(Colors.CONFIRM)
        .setFooter({
          text: `User ID: ${newState.member.user.id}`,
          iconURL: newState.member.user.displayAvatarURL({ dynamic: true })
        });
      await logChannel.send({ embeds: [vcUpdateEmbed] });
    } else if (!oldState.channel) {
      // if they join a channel
      const joinEmbed = new EmbedBuilder()
        .setDescription(`${newState.member.user} joined **${newState.channel.name}**`)
        .setColor(Colors.CONFIRM)
        .setTimestamp()
        .setFooter({
          text: `User ID: ${newState.member.user.id}`,
          iconURL: newState.member.user.displayAvatarURL({ dynamic: true })
        });

      await logChannel.send({ embeds: [joinEmbed] });
    } else if (!newState.channel) {
      // if they leave a channel
      const leaveEmbed = new EmbedBuilder()
        .setDescription(`${oldState.member.user} left **${oldState.channel.name}**`)
        .setColor(Colors.ERROR)
        .setTimestamp()
        .setFooter({
          text: `User ID: ${oldState.member.user.id}`,
          iconURL: oldState.member.user.displayAvatarURL({ dynamic: true })
        });

      await logChannel.send({ embeds: [leaveEmbed] });
    }

    if (oldState.channel.members.size === 0 && oldState.channel.parent.id === env.JOIN_TO_CREATE_CATEGORY_ID && oldState.channel.id !== env.JOIN_TO_CREATE_CHANNEL_ID) {
      // once a custom channel is empty
      const vcUpdateEmbed = new EmbedBuilder().setDescription(`**${oldState.channel.name}** was deleted after being empty.`).setColor(Colors.ERROR).setTimestamp();

      await oldState.channel.delete(`**${oldState.channel.name}** was deleted after being empty.`);

      await logChannel.send({ embeds: [vcUpdateEmbed] });
    } else if (oldState.channel.members.size === 1 && oldState.channel.members.has(env.DISCORD_CLIENT_ID) && oldState.channel.parentId === env.JOIN_TO_CREATE_CATEGORY_ID) {
      // bot is only one left in custom channel
      const vcUpdateEmbed = new EmbedBuilder().setDescription(`**${oldState.channel.name}** was deleted after being empty.`).setColor(Colors.ERROR).setTimestamp();

      await oldState.channel.delete(`**${oldState.channel.name}** was deleted after being empty.`);

      await logChannel.send({ embeds: [vcUpdateEmbed] });
    }
  } catch (error) {
    sendMessageInLogChannel(null, error, logChannel);
  }
}
