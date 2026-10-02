import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { SessionStreamEvent } from '#common/types/backend/parts/session-stream-event';

export type OcEventSt = {
  ocEvent: SessionStreamEvent;
};

export let zOcEventSt = z
  .object({ ocEvent: z.custom<SessionStreamEvent>() })
  .meta({ id: 'OcEventSt' });

assertTypesEqual<OcEventSt, z.infer<typeof zOcEventSt>>({ value: true });
