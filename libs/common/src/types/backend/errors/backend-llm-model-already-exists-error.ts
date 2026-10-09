import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendLlmModelAlreadyExistsError = {
  code: 'BACKEND_LLM_MODEL_ALREADY_EXISTS';
};

export let zBackendLlmModelAlreadyExistsError = z.object({
  code: z.literal('BACKEND_LLM_MODEL_ALREADY_EXISTS')
});

assertTypesEqual<
  BackendLlmModelAlreadyExistsError,
  z.infer<typeof zBackendLlmModelAlreadyExistsError>
>({ value: true });
