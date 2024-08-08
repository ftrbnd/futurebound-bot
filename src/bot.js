import { Client, Collection, Partials, GatewayIntentBits } from 'discord.js';
import { registerDistubeClient } from './lib/distube/index.js';
import { readdirSync } from 'fs';
import { resolve } from 'path';

export const client = new Client({
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

const __dirname = import.meta.dirname;

const commandsFolder = resolve(__dirname, './commands');
const eventsFolder = resolve(__dirname, './events');

client.commands = new Collection();
const commandFiles = readdirSync(commandsFolder).filter((file) => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

const eventFiles = readdirSync(eventsFolder).filter((file) => file.endsWith('.js'));
for (const file of eventFiles) {
  const event = await import(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.DisTube = await registerDistubeClient(client);
