import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendProviderModelNotAvailableInBuilderError = {
  code: 'BACKEND_PROVIDER_MODEL_NOT_AVAILABLE_IN_BUILDER';
};

export let zBackendProviderModelNotAvailableInBuilderError = z.object({
  code: z.literal('BACKEND_PROVIDER_MODEL_NOT_AVAILABLE_IN_BUILDER')
});

assertTypesEqual<
  BackendProviderModelNotAvailableInBuilderError,
  z.infer<typeof zBackendProviderModelNotAvailableInBuilderError>
>({ value: true });
