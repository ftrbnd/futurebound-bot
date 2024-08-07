import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, ChannelType } from 'discord.js';
import { sendErrorEmbed } from '../utils/sendErrorEmbed.js';
import { env } from '../utils/env.js';

export const data = new SlashCommandBuilder()
  .setName('say')
  .setDescription('Make the bot say something')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('message')
      .setDescription('Send a quick message')
      .addChannelOption((option) =>
        option.setName('channel').setDescription('The channel the message should be sent in').addChannelTypes(ChannelType.GuildAnnouncement, ChannelType.GuildText).setRequired(true)
      )
      .addStringOption((option) => option.setName('message').setDescription('What the bot should say').setRequired(true))
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('announcement')
      .setDescription('Allows for separate lines in a single message')
      .addChannelOption((option) =>
        option.setName('channel').setDescription('The channel the message should be sent in').addChannelTypes(ChannelType.GuildAnnouncement, ChannelType.GuildText).setRequired(true)
      )
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
export async function execute(interaction) {
  const targetChannel = interaction.options.getChannel('channel');

  try {
    if (interaction.options.getSubcommand() === 'message') {
      const messageToSend = interaction.options.getString('message');
      await targetChannel.send(messageToSend);

      const sentEmbed = new EmbedBuilder().setDescription(`Said **"${messageToSend}"** in ${targetChannel}`).setColor(env.CONFIRM_COLOR);

      await interaction.reply({ embeds: [sentEmbed] });
    } else if (interaction.options.getSubcommand() === 'announcement') {
      const sendEmbed = new EmbedBuilder().setDescription(`Enter the message that you want to announce into this channel within 3 minutes!`).setColor(env.CONFIRM_COLOR);

      await interaction.reply({ embeds: [sendEmbed] });

      const filter = (m) => m.author === interaction.user;
      const collector = interaction.channel.createMessageCollector({ filter, time: 180000 }); // milliseconds

      collector.on('collect', async (m) => {
        const announcementText = m.content;

        await targetChannel.send({ content: announcementText });

        collector.stop();
      });

      collector.on('end', async (collected) => {
        if (collected.size === 0) {
          // if no message was entered
          const couldntFindEmbed = new EmbedBuilder()
            .setDescription(`You did not send a message within 3 minutes, please try again.`)
            .setColor(env.ERROR_COLOR)
            .setFooter({
              text: interaction.guild.name,
              iconURL: interaction.guild.iconURL({ dynamic: true })
            });
          await interaction.followUp({ embeds: [couldntFindEmbed], ephemeral: true });
        } else {
          const announcedEmbed = new EmbedBuilder().setDescription(`The announcement was sent!`).setColor(env.CONFIRM_COLOR);
          await interaction.followUp({ embeds: [announcedEmbed] });
        }
      });
    }
  } catch (err) {
    sendErrorEmbed(interaction, err);
  }
}
