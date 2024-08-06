import { DisTube } from 'distube';
import { SpotifyPlugin } from '@distube/spotify';
import { SoundCloudPlugin } from '@distube/soundcloud';
import { readdirSync } from 'fs';
import { resolve } from 'path';

const __dirname = import.meta.dirname;

export async function registerDistubeClient(discordClient) {
  const distube = new DisTube(discordClient, {
    leaveOnStop: false,
    leaveOnEmpty: true,
    emptyCooldown: 1,
    emitNewSongOnly: true,
    emitAddSongWhenCreatingQueue: false,
    emitAddListWhenCreatingQueue: true,
    plugins: [
      new SpotifyPlugin({
        api: {
          clientId: process.env.SPOTIFY_CLIENT_ID,
          clientSecret: process.env.SPOTIFY_CLIENT_SECRET
        }
      }),
      new SoundCloudPlugin()
    ]
  });

  const commandsFolder = resolve(__dirname, './commands');
  const eventsFolder = resolve(__dirname, './events');

  const commandFiles = readdirSync(commandsFolder).filter((file) => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = await import(`./commands/${file}`);
    discordClient.commands.set(command.data.name, command);
  }

  const eventFiles = readdirSync(eventsFolder).filter((file) => file.endsWith('.js'));
  for (const file of eventFiles) {
    const event = await import(`./events/${file}`);
    if (event.once) {
      distube.once(event.name, (...args) => event.execute(...args));
    } else {
      distube.on(event.name, (...args) => event.execute(...args));
    }
  }

  return distube;
}
