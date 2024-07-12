const { Redis } = require('ioredis');
const { z } = require('zod');

const redis = new Redis(process.env.REDIS_URL).on('connect', () => {
  console.log('[Redis] Connected to eden-heardle-announcements');
});

const redisSchema = z.object({
  showBanner: z.boolean(),
  text: z.string(),
  link: z.string().optional().nullable(),
  status: z.enum(['success', 'info', 'error'])
});

module.exports = { redis, redisSchema };
