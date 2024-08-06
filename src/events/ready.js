import { EmbedBuilder, ActivityType } from 'discord.js';

const songs = [
  '02:09',
  'End Credits',
  'Gravity',
  'Nocturne',
  'Interlude',
  'Wake Up',
  'catch me if you can',
  'Billie Jean',
  'sex',
  'drugs',
  'and',
  'rock + roll',
  'Fumes',
  'XO',
  'Circles',
  'wrong',
  'take care',
  'start//end',
  'wings',
  'icarus',
  'lost//found',
  'crash',
  'gold',
  'forever//over',
  'float',
  'wonder',
  'love; not wrong (brave)',
  'falling in reverse',
  'about time',
  'stutter',
  'all you need is love',
  'nowhere else',
  '909',
  'good morning',
  'in',
  'hertz',
  'static',
  'projector',
  'love, death, distraction',
  'how to sleep',
  'calm down',
  'just saying',
  'fomo',
  'so far so good',
  'isohel',
  'tides',
  'rushing',
  '$treams',
  '2020',
  'out',
  'untitled',
  'Peaked',
  'Cold Feet',
  'Stingray',
  'cant help',
  '🔒 (demo)',
  'A Call',
  'Balling',
  'Sci-Fi',
  'Modern Warfare',
  'Waiting Room',
  'Closer 2',
  'PS1',
  'Call Me Back',
  'Duvidha',
  'Elsewhere',
  'Reaching 2',
  'cant',
  'The Love U Need'
];

export const name = 'ready';
export const once = true;
export async function execute(client) {
  let index = 0;
  let song = songs[index];

  client.user.setPresence({ activities: [{ name: song, type: ActivityType.Listening }] });

  setInterval(() => {
    song = songs[index >= songs.length - 1 ? 0 : ++index];

    client.user.setPresence({ activities: [{ name: song, type: ActivityType.Listening }] });
  }, 3 * 60 * 1000);

  const message = `**${client.user.tag}** is now ready`;
  const logChannel = client.channels.cache.get(process.env.LOGS_CHANNEL_ID);

  if (logChannel && process.env.NODE_ENV !== 'development') {
    const readyEmbed = new EmbedBuilder().setDescription(message).setColor(process.env.CONFIRM_COLOR);

    logChannel.send({ embeds: [readyEmbed] });
  }

  console.log(`[Discord] ${client.user.tag} is now ready`);
}
