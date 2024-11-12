import { Document } from 'mongoose';
import { Answer, QOTD } from '../schemas/QOTD';
import { Collection, Message, ThreadChannel } from 'discord.js';

/**
 *
 * @param {string} question
 * @param {Message} message
 * @returns
 */
export async function createQOTD(question, message) {
  const qotd = await QOTD.create({
    question,
    messageId: message.id
  });

  return qotd;
}

/**
 *
 * @param {ThreadChannel} thread
 */
export async function collectAnswers(thread) {
  if (!thread.isThread) throw new Error('Channel is not a thread');

  const starterMessage = await thread.fetchStarterMessage();
  const qotd = await QOTD.findOne({ messageId: starterMessage.id });

  const messages = await thread.messages.fetch();
  for (const [_, message] of messages) {
    qotd.answers.push({
      messageId: message.id,
      userId: message.author.id
    });
  }

  await qotd.save();
  return messages;
}

/**
 *
 * @param {Collection<string, Message<true>>} messages
 */
export async function getTopAnswer(messages) {
  let mostPopular = null;
  let max = 0;

  for (const [_, message] of messages) {
    const starCount = message.reactions.cache.find((r) => r.emoji === '⭐').count;

    if (starCount > max) {
      max = starCount;
      mostPopular = message;
    }
  }

  return mostPopular;
}
