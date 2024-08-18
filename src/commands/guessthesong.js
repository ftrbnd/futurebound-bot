import { readdirSync } from 'fs';
import { resolve } from 'path';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { lineSplitFile } from '../utils/line-split-file.js';
import { Colors, EDEN_LOGO } from '../utils/constants.js';

const __dirname = import.meta.dirname;

export const data = new SlashCommandBuilder().setName('guessthesong').setDescription('Guess the song within 15 seconds!');

export async function execute(interaction) {
  const lyricsFolder = resolve(__dirname, '../text-files/lyrics');

  const songFiles = readdirSync(lyricsFolder).filter((file) => file.endsWith('.txt'));
  let randomSongFile = songFiles[Math.floor(Math.random() * songFiles.length)]; // choose a random song.txt
  let songName = randomSongFile.slice(0, -4);

  // handle ---- to ????, start--end to start//end, etc.
  switch (songName) {
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

  let lyrics = await lineSplitFile(`${lyricsFolder}/${randomSongFile}`); // get the lyrics
  lyrics = lyrics.filter((item) => item); // get rid of empty strings ''

  let randomIndex = Math.floor(Math.random() * lyrics.length);
  if (randomIndex === lyrics.length - 1)
    // if the last line is selected, move back one line so we are able to select 2 lines
    randomIndex--;

  const randomLyric = lyrics[randomIndex] + '\n' + lyrics[randomIndex + 1];

  const guessTheSongEmbed = new EmbedBuilder()
    .setTitle(`Guess The Song`)
    .setThumbnail(EDEN_LOGO)
    .setColor(Colors.GUESSTHESONG)
    .setDescription(`${randomLyric}`)
    .setFooter({
      text: interaction.guild.name,
      iconURL: interaction.guild.iconURL({ dynamic: true })
    });
  await interaction.reply({ embeds: [guessTheSongEmbed] });

  const filter = (m) => m.content.toLowerCase().includes(songName.toLowerCase());
  const collector = interaction.channel.createMessageCollector({ filter, time: 15000 }); // collector stops checking after 15 seconds

  collector.on('collect', async (m) => {
    const winnerEmbed = new EmbedBuilder()
      .setTitle(m.author.username + ' guessed the song!')
      .addFields([{ name: 'Song', value: songName }])
      .setDescription(`${randomLyric}`)
      .setThumbnail(m.author.displayAvatarURL({ dynamic: true }))
      .setColor(Colors.CONFIRM)
      .setFooter({
        text: m.guild.name,
        iconURL: m.guild.iconURL({ dynamic: true })
      });

    await m.reply({ embeds: [winnerEmbed] });
    collector.stop();
  });

  collector.on('end', async (collected) => {
    if (collected.size == 0) {
      // if no correct song was guessed (collected by the MessageCollector)
      const timesUpEmbed = new EmbedBuilder()
        .setTitle('Nobody guessed the song within 15 seconds.')
        .addFields([{ name: 'Song', value: songName }])
        .setDescription(`${randomLyric}`)
        .setColor(Colors.ERROR)
        .setFooter({
          text: interaction.guild.name,
          iconURL: interaction.guild.iconURL({ dynamic: true })
        });

      await interaction.followUp({ embeds: [timesUpEmbed] });
    }
  });
}
