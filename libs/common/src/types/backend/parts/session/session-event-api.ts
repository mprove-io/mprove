import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { SessionStreamEvent } from './session-stream-event';

export type SessionEventApi = {
  eventId: string;
  eventIndex: number;
  eventType: string;
  ocEvent: SessionStreamEvent;
};

export let zSessionEventApi = z
  .object({
    eventId: z.string(),
    eventIndex: z.number().int(),
    eventType: z.string(),
    ocEvent: z.custom<SessionStreamEvent>()
  })
  .meta({ id: 'SessionEventApi' });

assertTypesEqual<SessionEventApi, z.infer<typeof zSessionEventApi>>({
  value: true
});
