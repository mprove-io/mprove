import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendInteractTimeoutError = {
  code: 'BACKEND_INTERACT_TIMEOUT';
  customData?: {
    sessionId: string;
    timeoutMs: number;
  };
};

export let zBackendInteractTimeoutError = z.object({
  code: z.literal('BACKEND_INTERACT_TIMEOUT'),
  customData: z
    .object({
      sessionId: z.string(),
      timeoutMs: z.number()
    })
    .nullish()
});

assertTypesEqual<
  BackendInteractTimeoutError,
  z.infer<typeof zBackendInteractTimeoutError>
>({ value: true });
