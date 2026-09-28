import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendMessageProviderRequiredError = {
  code: 'BACKEND_MESSAGE_PROVIDER_REQUIRED';
};

export let zBackendMessageProviderRequiredError = z.object({
  code: z.literal('BACKEND_MESSAGE_PROVIDER_REQUIRED')
});

assertTypesEqual<
  BackendMessageProviderRequiredError,
  z.infer<typeof zBackendMessageProviderRequiredError>
>({ value: true });
