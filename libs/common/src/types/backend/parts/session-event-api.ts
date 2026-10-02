import { z } from 'zod';
import type { SessionStreamEvent } from './session-stream-event';

export let zSessionEventApi = z
  .object({
    eventId: z.string(),
    eventIndex: z.number().int(),
    eventType: z.string(),
    ocEvent: z.custom<SessionStreamEvent>()
  })
  .meta({ id: 'SessionEventApi' });

export type SessionEventApi = z.infer<typeof zSessionEventApi>;
