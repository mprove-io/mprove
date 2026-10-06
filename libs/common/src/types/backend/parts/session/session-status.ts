import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export const sessionStatusValues = [
  'New',
  'Active',
  'Paused',
  'Error',
  'Archived',
  'Deleted'
] as const;

export type SessionStatus = (typeof sessionStatusValues)[number];

export let zSessionStatus = z.enum(sessionStatusValues);

assertTypesEqual<SessionStatus, z.infer<typeof zSessionStatus>>({
  value: true
});
