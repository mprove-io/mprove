import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendMessageVariantRequiredError = {
  code: 'BACKEND_MESSAGE_VARIANT_REQUIRED';
};

export let zBackendMessageVariantRequiredError = z.object({
  code: z.literal('BACKEND_MESSAGE_VARIANT_REQUIRED')
});

assertTypesEqual<
  BackendMessageVariantRequiredError,
  z.infer<typeof zBackendMessageVariantRequiredError>
>({ value: true });
