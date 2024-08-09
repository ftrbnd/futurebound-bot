import { EmbedBuilder } from 'discord.js';
import { env } from '../utils/env.js';
import { Colors } from '../utils/constants.js';
import { sendMessageInLogChannel } from '../utils/error-handler.js';

export const name = 'messageDelete';
export async function execute(message) {
  const logChannel = message.guild.channels.cache.get(env.LOGS_CHANNEL_ID);
  if (!logChannel) return;

  try {
    if (message.author.bot) return;

    const msgDeleteEmbed = new EmbedBuilder()
      .setAuthor({
        name: `A message by ${message.author.tag} was deleted`,
        iconURL: message.author.displayAvatarURL({ dynamic: true })
      })
      .addFields([{ name: 'Channel', value: `${message.channel}` }])
      .setColor(Colors.ERROR)
      .setTimestamp();

    if (message.attachments.size > 0) {
      let messageNote = '**Attachment(s) will be sent below**';
      if (message.content != '')
        // if the message had any text
        messageNote = '**Text:** ' + message.content + `\n${messageNote}`;

      msgDeleteEmbed.setDescription(messageNote);
      const embedMessage = await logChannel.send({ embeds: [msgDeleteEmbed] });

      message.attachments.forEach(async (attachment) => {
        const attachmentEmbed = new EmbedBuilder().setTitle(`Deleted attachment from ${message.author.tag}`).setImage(attachment.url).setColor(Colors.ERROR);

        await embedMessage.reply({ embeds: [attachmentEmbed] });
      });
    } else if (message.content != '' && message.attachments.size == 0) {
      // message has text only and no attachments
      msgDeleteEmbed.setDescription('**Text:** ' + message.content);
      await logChannel.send({ embeds: [msgDeleteEmbed] });
    }
  } catch (error) {
    await sendMessageInLogChannel(null, error, logChannel);
  }
}
