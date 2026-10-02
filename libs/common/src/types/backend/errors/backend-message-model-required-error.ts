import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendMessageModelRequiredError = {
  code: 'BACKEND_MESSAGE_MODEL_REQUIRED';
};

export let zBackendMessageModelRequiredError = z.object({
  code: z.literal('BACKEND_MESSAGE_MODEL_REQUIRED')
});

assertTypesEqual<
  BackendMessageModelRequiredError,
  z.infer<typeof zBackendMessageModelRequiredError>
>({ value: true });
