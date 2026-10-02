import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendWrongSpecialKeyError = {
  code: 'BACKEND_WRONG_SPECIAL_KEY';
};

export let zBackendWrongSpecialKeyError = z.object({
  code: z.literal('BACKEND_WRONG_SPECIAL_KEY')
});

assertTypesEqual<
  BackendWrongSpecialKeyError,
  z.infer<typeof zBackendWrongSpecialKeyError>
>({ value: true });
