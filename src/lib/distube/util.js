import { ChatInputCommandInteraction } from 'discord.js';
import { getMusicPermission } from '../mongo/services/MusicPermission.js';

/**
 * @param {ChatInputCommandInteraction} interaction
 */
export const checkPermissionsAndVoiceStatus = async (interaction) => {
  const permission = await getMusicPermission();

  if (!interaction.member._roles.includes(permission.roleId) && permission.roleId != interaction.guild.roles.everyone.id) {
    throw new Error(`You do not have permission to use music commands right now!`);
  }

  const voiceChannel = interaction.member.voice.channel;
  if (!voiceChannel) {
    throw new Error(`You must join a voice channel!`);
  }
};

export const checkQueue = async (interaction) => {
  const queue = interaction.client.DisTube.getQueue(interaction.guild);
  if (!queue) {
    throw new Error(`The queue is empty!`);
  }

  return queue;
};
