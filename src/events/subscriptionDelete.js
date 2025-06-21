import { Subscription } from 'discord.js';

export const name = 'subscriptionDelete';

/**
 * @param {Subscription} subscription
 */
export async function execute(subscription) {
  try {
    console.log('Events.SubscriptionDelete', { subscription });
  } catch (error) {
    await sendMessageInLogChannel(null, error, logChannel);
  }
}
