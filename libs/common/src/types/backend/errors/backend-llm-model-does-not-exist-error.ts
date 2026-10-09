import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendLlmModelDoesNotExistError = {
  code: 'BACKEND_LLM_MODEL_DOES_NOT_EXIST';
};

export let zBackendLlmModelDoesNotExistError = z.object({
  code: z.literal('BACKEND_LLM_MODEL_DOES_NOT_EXIST')
});

assertTypesEqual<
  BackendLlmModelDoesNotExistError,
  z.infer<typeof zBackendLlmModelDoesNotExistError>
>({ value: true });
