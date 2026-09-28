import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendSuggestFieldNotFoundError = {
  code: 'BACKEND_SUGGEST_FIELD_NOT_FOUND';
};

export let zBackendSuggestFieldNotFoundError = z.object({
  code: z.literal('BACKEND_SUGGEST_FIELD_NOT_FOUND')
});

assertTypesEqual<
  BackendSuggestFieldNotFoundError,
  z.infer<typeof zBackendSuggestFieldNotFoundError>
>({ value: true });
