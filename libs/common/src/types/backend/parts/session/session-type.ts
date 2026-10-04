import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const sessionTypeValues = ['Explorer', 'Editor'] as const;

export type SessionType = (typeof sessionTypeValues)[number];

export let zSessionType = z.enum(sessionTypeValues);

assertTypesEqual<SessionType, z.infer<typeof zSessionType>>({
  value: true
});
