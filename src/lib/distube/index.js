const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const { SoundCloudPlugin } = require('@distube/soundcloud');
const fs = require('fs');
const path = require('path');

function registerDistubeClient(discordClient) {
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

  const commandsFolder = path.resolve(__dirname, './commands');
  const eventsFolder = path.resolve(__dirname, './events');

  const commandFiles = fs.readdirSync(commandsFolder).filter((file) => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    discordClient.commands.set(command.data.name, command);
  }

  const eventFiles = fs.readdirSync(eventsFolder).filter((file) => file.endsWith('.js'));
  for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
      distube.once(event.name, (...args) => event.execute(...args));
    } else {
      distube.on(event.name, (...args) => event.execute(...args));
    }
  }

  return distube;
}

module.exports = { registerDistubeClient };
