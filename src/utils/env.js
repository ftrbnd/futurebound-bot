import dotenv from 'dotenv';
dotenv.config();

import z from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['production', 'development']).optional(),

  DISCORD_TOKEN: z.string(),
  DISCORD_CLIENT_ID: z.string(),
  GUILD_ID: z.string(),

  MONGODB_URI: z.string(),

  HEARDLE_WEBHOOK_ID: z.string(),
  HEARDLE_CHANNEL_ID: z.string(),
  HEARDLE_ROLE_ID: z.string(),
  HEARDLE_SERVER_URL: z.string().url(),

  SPOTIFY_CLIENT_ID: z.string(),
  SPOTIFY_CLIENT_SECRET: z.string(),

  IMGUR_ALBUMS: z.string().transform((val) => val.split(',')),

  ANNOUNCEMENTS_CHANNEL_ID: z.string(),
  BOTS_CHANNEL_ID: z.string(),
  BOT_BAIT_CHANNEL_ID: z.string(),
  COMMANDS_CHANNEL_ID: z.string(),
  GENERAL_CHANNEL_ID: z.string(),
  GIVEAWAY_CHANNEL_ID: z.string(),
  JOIN_TO_CREATE_CHANNEL_ID: z.string(),
  INTRODUCTIONS_CHANNEL_ID: z.string(),
  LOGS_CHANNEL_ID: z.string(),
  MODERATORS_CHANNEL_ID: z.string(),
  ROLES_CHANNEL_ID: z.string(),
  SURVIVOR_CHANNEL_ID: z.string(),
  VOICE_CHAT_CHANNEL_ID: z.string(),
  WELCOME_CHANNEL_ID: z.string(),

  JOIN_TO_CREATE_CATEGORY_ID: z.string(),

  MODERATORS_ROLE_ID: z.string(),
  HELPERS_ROLE_ID: z.string(),
  TIER_3_ROLE_ID: z.string(),
  SUBSCRIBER_ROLE_ID: z.string(),
  BOOSTER_ROLE_ID: z.string(),
  SURVIVOR_ROLE_ID: z.string(),
  MUTED_ROLE_ID: z.string(),
  SUBSCRIBER_ROLE_IDS: z.string().transform((val) => val.split(',')),
  ALBUM_ROLE_IDS: z.string().transform((val) => val.split(',')),

  INTRODUCTIONS_REACTION_EMOJI_ID: z.string(),
  GIVEAWAY_EMOJI_ID: z.string(),
  NUMBER_EMOJIS: z.string().transform((val) => val.split(','))
});

export const env = envSchema.parse(process.env);
