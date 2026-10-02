import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendProviderModelNotAvailableInExplorerError = {
  code: 'BACKEND_PROVIDER_MODEL_NOT_AVAILABLE_IN_EXPLORER';
};

export let zBackendProviderModelNotAvailableInExplorerError = z.object({
  code: z.literal('BACKEND_PROVIDER_MODEL_NOT_AVAILABLE_IN_EXPLORER')
});

assertTypesEqual<
  BackendProviderModelNotAvailableInExplorerError,
  z.infer<typeof zBackendProviderModelNotAvailableInExplorerError>
>({ value: true });
