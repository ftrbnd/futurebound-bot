import { sendMessageInLogChannel } from '../../../utils/error-handler.js';

export const name = 'error';
export async function execute(channel, error) {
  await sendMessageInLogChannel(null, error, channel);
}
