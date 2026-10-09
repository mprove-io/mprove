import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendLlmModelNotDiscoveredError = {
  code: 'BACKEND_LLM_MODEL_NOT_DISCOVERED';
};

export let zBackendLlmModelNotDiscoveredError = z.object({
  code: z.literal('BACKEND_LLM_MODEL_NOT_DISCOVERED')
});

assertTypesEqual<
  BackendLlmModelNotDiscoveredError,
  z.infer<typeof zBackendLlmModelNotDiscoveredError>
>({ value: true });
