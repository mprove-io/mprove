import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export const ssePhaseValues = [
  'idle',
  'fetching-ticket',
  'connected',
  'waiting-to-reconnect'
] as const;

export type SsePhase = (typeof ssePhaseValues)[number];

export let zSsePhase = z.enum(ssePhaseValues);

assertTypesEqual<SsePhase, z.infer<typeof zSsePhase>>({
  value: true
});
