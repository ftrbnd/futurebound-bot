import { readdirSync } from 'fs';
import { resolve } from 'path';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { sendErrorEmbed } from '../utils/sendErrorEmbed.js';
import { lineSplitFile } from '../utils/lineSplitFile.js';
import { env } from '../utils/env.js';
import { Colors, EDEN_LOGO } from '../utils/constants.js';

const __dirname = import.meta.dirname;

export const data = new SlashCommandBuilder()
  .setName('lyrics')
  .setDescription('Get the lyrics of a song')
  .addStringOption((option) => option.setName('song').setDescription('The song to go get the lyrics of').setRequired(true));
export async function execute(interaction) {
  try {
    let song = interaction.options.getString('song').toLowerCase();

    const lyricsFolder = resolve(__dirname, '../text-files/lyrics');
    const songFiles = readdirSync(lyricsFolder).filter((file) => file.endsWith('.txt'));

    for (let i = 0; i < songFiles.length; i++) {
      let songName = songFiles[i].slice(0, -4); // remove '.txt'
      switch (
        songName // handle ---- to ????, start--end to start//end, etc.
      ) {
        case '----':
          songName = '????';
          break;
        case 'start--end':
          songName = 'start//end';
          break;
        case 'lost--found':
          songName = 'lost//found';
          break;
        case 'forever--over':
          songName = 'forever//over';
          break;
      }

      if (song === songName.toLowerCase()) {
        // if the song the user requested and the current song are the same
        const lyrics = await lineSplitFile(`${lyricsFolder}/${songFiles[i]}`); // get the lyrics
        const lyricsString = lyrics.join('\n');
        song = songName;

        if (songName.toLowerCase() === 'Fumes'.toLowerCase()) songName = 'Fumes (feat. gnash)';

        let lyricsEmbed = new EmbedBuilder().setTitle(songName).setDescription(lyricsString).setColor(Colors.ERROR);

        const albumsFolder = resolve(__dirname, '../text-files/albums');
        const albumFiles = readdirSync(albumsFolder).filter((file) => file.endsWith('.txt'));
        for (let i = 0; i < albumFiles.length; i++) {
          // check if the song belongs to any album
          const albumTracks = await lineSplitFile(`${albumsFolder}/${albumFiles[i]}`);
          const embedColor = `${albumTracks.pop()}`;
          const albumCover = albumTracks.pop();
          if (albumTracks.includes(songName)) {
            lyricsEmbed.setColor(embedColor);
            lyricsEmbed.setThumbnail(albumCover);
            break;
          } else {
            // if the song is not from any album
            lyricsEmbed.setColor('Grey');
            lyricsEmbed.setThumbnail(EDEN_LOGO);
          }
        }

        return await interaction.reply({ embeds: [lyricsEmbed] });
      }
    }

    if (!songFiles.includes(song)) {
      const errEmbed = new EmbedBuilder().setDescription(`**${song}** is not a valid song, please try again!`).setColor(Colors.ERROR);
      return await interaction.reply({ embeds: [errEmbed], ephemeral: true });
    }
  } catch (err) {
    sendErrorEmbed(interaction, err);
  }
}
