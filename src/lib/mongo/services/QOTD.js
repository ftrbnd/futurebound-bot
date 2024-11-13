import { QOTD } from '../schemas/QOTD.js';
import { Collection, Message, ThreadChannel, User } from 'discord.js';

/**
 *
 * @param {string} question
 * @param {Message} message
 * @param {User} user
 * @returns
 */
export async function createQOTD(question, message, user) {
  const qotd = await QOTD.create({
    question,
    messageId: message.id,
    userId: user.id
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
    const starReactions = message.reactions.cache.filter((r) => r.emoji.name === '⭐').get('⭐');
    const starCount = starReactions ? starReactions.count : 0;

    if (starCount > max) {
      max = starCount;
      mostPopular = message;
    }
  }

  return {
    topAnswer: mostPopular,
    count: max
  };
}

export async function getDailyNumber() {
  const count = await QOTD.countDocuments();
  return count;
}
