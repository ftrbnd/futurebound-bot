import { Subscription } from 'discord.js';

export const name = 'subscriptionUpdate';

/**
 * @param {Subscription} subscription
 */
export async function execute(subscription) {
  try {
    console.log('Events.SubscriptionUpdate', { subscription });
  } catch (error) {
    await sendMessageInLogChannel(null, error, logChannel);
  }
}
