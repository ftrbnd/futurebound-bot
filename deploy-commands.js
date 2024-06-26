require('dotenv').config();
const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const commands = [];

const commandFiles = fs.readdirSync('./src/commands').filter((file) => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./src/commands/${file}`);
  commands.push(command.data.toJSON());
}

const musicCommandFiles = fs.readdirSync('./src/musicCommands').filter((file) => file.endsWith('.js'));
for (const file of musicCommandFiles) {
  const musicCommand = require(`./src/musicCommands/${file}`);
  commands.push(musicCommand.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands });

    console.log('Successfully registered application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();
