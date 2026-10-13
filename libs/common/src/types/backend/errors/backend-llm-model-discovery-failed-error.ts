import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendLlmModelDiscoveryFailedError = {
  code: 'BACKEND_LLM_MODEL_DISCOVERY_FAILED';
  customData?: {
    originalError?: unknown;
  };
};

export let zBackendLlmModelDiscoveryFailedError = z.object({
  code: z.literal('BACKEND_LLM_MODEL_DISCOVERY_FAILED'),
  customData: z
    .object({
      originalError: z.unknown().nullish()
    })
    .nullish()
});

assertTypesEqual<
  BackendLlmModelDiscoveryFailedError,
  z.infer<typeof zBackendLlmModelDiscoveryFailedError>
>({ value: true });
