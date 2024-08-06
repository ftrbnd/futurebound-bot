import imgur from 'imgur';
import { SlashCommandBuilder } from 'discord.js';
import { sendErrorEmbed } from '../utils/sendErrorEmbed.js';

const { getAlbumInfo } = imgur;

export const data = new SlashCommandBuilder().setName('eden').setDescription('Get a random picture of EDEN');
export async function execute(interaction) {
  try {
    const edenAlbumOne = '3Zh414x';
    const edenAlbumTwo = 'DZ913Hd';
    const edenAlbumThree = 'PUfyYtt';
    const edenImages = [];

    getAlbumInfo(edenAlbumOne)
      .then((json) => {
        json.images.forEach((image) => {
          edenImages.push(image.link);
        });
      })
      .catch((err) => {
        console.error(err.message);
      });

    getAlbumInfo(edenAlbumTwo)
      .then((json) => {
        json.images.forEach((image) => {
          edenImages.push(image.link);
        });
      })
      .catch((err) => {
        console.error(err.message);
      });

    getAlbumInfo(edenAlbumThree)
      .then((json) => {
        json.images.forEach((image) => {
          edenImages.push(image.link);
        });

        interaction.reply({ files: [`${edenImages[Math.floor(Math.random() * edenImages.length)]}`] });
      })
      .catch((err) => {
        console.error(err.message);
      });
  } catch (err) {
    sendErrorEmbed(interaction, err);
  }
}
