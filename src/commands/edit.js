import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { Colors } from '../utils/constants.js';

export const data = new SlashCommandBuilder()
  .setName('edit-message')
  .setDescription('Edit a message')
  .addChannelOption((option) => option.setName('channel').setDescription('The channel this message was sent in').setRequired(true))
  .addStringOption((option) => option.setName('id').setDescription('The id of the message (enable dev mode)').setRequired(true))
  .addBooleanOption((option) => option.setName('replacing').setDescription('Are you replacing the original message? Otherwise, you will be adding to the existing message').setRequired(true))
  .addBooleanOption((option) => option.setName('new-line').setDescription('Start a new line? This only applies if the [replacing] option is set to false').setRequired(false))
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  const channel = interaction.options.getChannel('channel');
  const id = interaction.options.getString('id');
  const isReplacing = interaction.options.getBoolean('replacing');
  const newLine = interaction.options.getBoolean('new-line');

  const message = await channel.messages.fetch(id);
  if (!message) throw new Error('Failed to find message. Was the channel entered correct?');

  const originalMessageEmbed = new EmbedBuilder()
    .setTitle('Edit Message')
    .addFields([
      { name: 'Original message', value: `${message.content}` },
      { name: 'Last edited', value: `${message.editedAt ?? message.createdAt}` }
    ])
    .setColor(Colors.BLACK);

  const replyEmbed = new EmbedBuilder().setColor(Colors.YELLOW);

  const filter = (m) => m.author === interaction.user;
  const collector = interaction.channel.createMessageCollector({ filter, time: 180000 }); // milliseconds

  let newText = '';

  if (isReplacing) {
    replyEmbed.setDescription(`Enter the new message content within 3 minutes`);
    await interaction.reply({ embeds: [originalMessageEmbed, replyEmbed] });

    collector.on('collect', async (m) => {
      newText = m.content;
      await message.edit(newText);

      collector.stop();
    });
  } else {
    replyEmbed.setDescription('Enter the message content to be added to the end of the original message');
    await interaction.reply({ embeds: [originalMessageEmbed, replyEmbed] });

    collector.on('collect', async (m) => {
      newText = m.content;
      newText = message.content + (newLine ? `\n${newText}` : newText);

      await message.edit(newText);

      collector.stop();
    });
  }

  collector.on('end', async (collected) => {
    if (collected.size === 0) {
      throw new Error(`You did not send a message within 3 minutes, please try again.`);
    } else {
      const followUpEmbed = new EmbedBuilder()
        .setTitle('Edit Message')
        .setDescription(`The message was successfully ${isReplacing ? 'replaced' : 'edited'}!`)
        .addFields([{ name: 'New message', value: newText }])
        .setColor(Colors.CONFIRM);

      await interaction.followUp({ content: `${message.url}`, embeds: [followUpEmbed] });
    }
  });
}
