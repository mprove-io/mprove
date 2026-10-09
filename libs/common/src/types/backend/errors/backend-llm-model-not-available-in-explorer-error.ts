import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendLlmModelNotAvailableInExplorerError = {
  code: 'BACKEND_LLM_MODEL_NOT_AVAILABLE_IN_EXPLORER';
};

export let zBackendLlmModelNotAvailableInExplorerError = z.object({
  code: z.literal('BACKEND_LLM_MODEL_NOT_AVAILABLE_IN_EXPLORER')
});

assertTypesEqual<
  BackendLlmModelNotAvailableInExplorerError,
  z.infer<typeof zBackendLlmModelNotAvailableInExplorerError>
>({ value: true });
