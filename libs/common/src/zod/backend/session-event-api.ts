import type { Event } from '@opencode-ai/sdk/v2';
import { z } from 'zod';

export let zSessionEventApi = z
  .object({
    eventId: z.string(),
    eventIndex: z.number().int(),
    eventType: z.string(),
    ocEvent: z.custom<Event>()
  })
  .meta({ id: 'SessionEventApi' });

export type SessionEventApi = z.infer<typeof zSessionEventApi>;
