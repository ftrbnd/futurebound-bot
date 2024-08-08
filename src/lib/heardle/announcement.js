import { z } from 'zod';

export const heardleAnnouncementSchema = z.object({
  showBanner: z.boolean(),
  text: z.string(),
  link: z.string().optional().nullable(),
  status: z.enum(['success', 'info', 'error'])
});
