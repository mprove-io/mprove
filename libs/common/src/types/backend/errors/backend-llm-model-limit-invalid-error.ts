import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendLlmModelLimitInvalidError = {
  code: 'BACKEND_LLM_MODEL_LIMIT_INVALID';
};

export let zBackendLlmModelLimitInvalidError = z.object({
  code: z.literal('BACKEND_LLM_MODEL_LIMIT_INVALID')
});

assertTypesEqual<
  BackendLlmModelLimitInvalidError,
  z.infer<typeof zBackendLlmModelLimitInvalidError>
>({ value: true });
