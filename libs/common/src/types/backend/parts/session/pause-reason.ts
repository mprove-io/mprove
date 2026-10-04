import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const pauseReasonValues = ['User', 'Idle', 'Safe', 'External'] as const;

export type PauseReason = (typeof pauseReasonValues)[number];

export let zPauseReason = z.enum(pauseReasonValues);

assertTypesEqual<PauseReason, z.infer<typeof zPauseReason>>({
  value: true
});
