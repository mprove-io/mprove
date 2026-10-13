import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendInteractFailedError = {
  code: 'BACKEND_INTERACT_FAILED';
  customData?: {
    sessionId: string;
    error?: unknown;
  };
};

export let zBackendInteractFailedError = z.object({
  code: z.literal('BACKEND_INTERACT_FAILED'),
  customData: z
    .object({
      sessionId: z.string(),
      error: z.unknown().nullish()
    })
    .nullish()
});

assertTypesEqual<
  BackendInteractFailedError,
  z.infer<typeof zBackendInteractFailedError>
>({ value: true });
