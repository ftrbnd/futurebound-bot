import { Subscription } from 'discord.js';

export const name = 'subscriptionCreate';

/**
 * @param {Subscription} subscription
 */
export async function execute(subscription) {
  try {
    console.log('Events.SubscriptionCreate', { subscription });
  } catch (error) {
    await sendMessageInLogChannel(null, error, logChannel);
  }
}
