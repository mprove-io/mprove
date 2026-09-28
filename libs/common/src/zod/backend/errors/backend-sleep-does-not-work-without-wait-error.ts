import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendSleepDoesNotWorkWithoutWaitError = {
  code: 'BACKEND_SLEEP_DOES_NOT_WORK_WITHOUT_WAIT';
};

export let zBackendSleepDoesNotWorkWithoutWaitError = z.object({
  code: z.literal('BACKEND_SLEEP_DOES_NOT_WORK_WITHOUT_WAIT')
});

assertTypesEqual<
  BackendSleepDoesNotWorkWithoutWaitError,
  z.infer<typeof zBackendSleepDoesNotWorkWithoutWaitError>
>({ value: true });
