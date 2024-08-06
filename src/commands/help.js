import { readdirSync } from 'fs';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { sendErrorEmbed } from '../utils/sendErrorEmbed.js';

export const data = new SlashCommandBuilder().setName('help').setDescription('Get a list of the commands for this bot');
export async function execute(interaction) {
  try {
    const helpEmbed = new EmbedBuilder()
      .setTitle(`Commands for ***${interaction.client.user.tag}***`)
      .setFooter({
        text: interaction.guild.name,
        iconURL: interaction.guild.iconURL({ dynamic: true })
      })
      .setColor('f03200');

    let everyoneCommandsList = '',
      helperCommandsList = '',
      modCommandsList = '';
    const commandFiles = readdirSync('./commands').filter((file) => file.endsWith('.js'));
    for (const file of commandFiles) {
      const command = await import(`./${file}`);

      if (!command.data.default_member_permissions) {
        // if the command has no Helper/Mod permissions required
        everyoneCommandsList += `/${file.replace('.js', '')}\n`;
      } else if (command.data.default_member_permissions === '268435456') {
        // Helper command
        helperCommandsList += `/${file.replace('.js', '')}\n`;
      } else if (command.data.default_member_permissions === '8') {
        // Moderator command
        modCommandsList += `/${file.replace('.js', '')}\n`;
      }
    }

    let musicCommandsList = '';
    const musicCommandFiles = readdirSync('./musicCommands').filter((file) => file.endsWith('.js'));
    for (const file of musicCommandFiles) {
      musicCommandsList += `/${file.replace('.js', '')}\n`;
    }

    if (interaction.member.roles.cache.has(process.env.MODERATORS_ROLE_ID)) {
      // Moderator role
      helpEmbed.addFields([
        { name: 'Moderator Commands', value: modCommandsList, inline: true },
        { name: 'Helper Commands', value: helperCommandsList, inline: true },
        { name: '@everyone Commands', value: everyoneCommandsList, inline: true },
        { name: 'Music Commands', value: musicCommandsList, inline: true }
      ]);
    } else if (interaction.member.roles.cache.has(process.env.HELPER_ROLE_ID)) {
      // Helper role
      helpEmbed.addFields([
        { name: 'Helper Commands', value: helperCommandsList },
        { name: '@everyone Commands', value: everyoneCommandsList, inline: true },
        { name: 'Music Commands', value: musicCommandsList, inline: true }
      ]);
    } else {
      // @everyone
      helpEmbed.addFields([
        { name: '@everyone Commands', value: everyoneCommandsList, inline: true },
        { name: 'Music Commands', value: musicCommandsList, inline: true }
      ]);
    }

    interaction.reply({ embeds: [helpEmbed] });
  } catch (err) {
    sendErrorEmbed(interaction, err);
  }
}
