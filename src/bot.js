const fs = require('fs');
const path = require('path');
const { Client, Collection, Partials, GatewayIntentBits } = require('discord.js');
const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const { SoundCloudPlugin } = require('@distube/soundcloud');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel]
});

const commandsFolder = path.resolve(__dirname, './commands');
const eventsFolder = path.resolve(__dirname, './events');

client.commands = new Collection();
const commandFiles = fs.readdirSync(commandsFolder).filter((file) => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

const eventFiles = fs.readdirSync(eventsFolder).filter((file) => file.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.DisTube = new DisTube(client, {
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

const musicCommandsFolder = path.resolve(__dirname, './musicCommands');
const musicEventsFolder = path.resolve(__dirname, './musicEvents');

const musicCommandFiles = fs.readdirSync(musicCommandsFolder).filter((file) => file.endsWith('.js'));
for (const file of musicCommandFiles) {
  const musicCommand = require(`./musicCommands/${file}`);
  client.commands.set(musicCommand.data.name, musicCommand);
}

const musicEventFiles = fs.readdirSync(musicEventsFolder).filter((file) => file.endsWith('.js'));
for (const file of musicEventFiles) {
  const musicEvent = require(`./musicEvents/${file}`);
  if (musicEvent.once) {
    client.DisTube.once(musicEvent.name, (...args) => musicEvent.execute(...args));
  } else {
    client.DisTube.on(musicEvent.name, (...args) => musicEvent.execute(...args));
  }
}

module.exports = {
  client
};
