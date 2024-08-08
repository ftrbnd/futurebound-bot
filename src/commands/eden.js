import imgur from 'imgur';
import { SlashCommandBuilder } from 'discord.js';
import { sendErrorEmbed } from '../utils/sendErrorEmbed.js';
import { env } from '../utils/env.js';

const { getAlbumInfo } = imgur;

export const data = new SlashCommandBuilder().setName('eden').setDescription('Get a random picture of EDEN');
export async function execute(interaction) {
  try {
    const albums = env.IMGUR_ALBUMS;
    const images = [];

    for (const album of albums) {
      const json = await getAlbumInfo(album);
      for (const image of json.images) {
        images.push(image.link);
      }
    }

    const randomImageUrl = images[Math.floor(Math.random() * images.length)];

    await interaction.reply({ files: [randomImageUrl] });
  } catch (err) {
    sendErrorEmbed(interaction, err);
  }
}
