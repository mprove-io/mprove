import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendLlmModelNotAvailableInBuilderError = {
  code: 'BACKEND_LLM_MODEL_NOT_AVAILABLE_IN_BUILDER';
};

export let zBackendLlmModelNotAvailableInBuilderError = z.object({
  code: z.literal('BACKEND_LLM_MODEL_NOT_AVAILABLE_IN_BUILDER')
});

assertTypesEqual<
  BackendLlmModelNotAvailableInBuilderError,
  z.infer<typeof zBackendLlmModelNotAvailableInBuilderError>
>({ value: true });
