import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendWrongGivenValueError = {
  code: 'BACKEND_WRONG_GIVEN_VALUE';
  displayData?: { error: string };
};

export let zBackendWrongGivenValueError = z.object({
  code: z.literal('BACKEND_WRONG_GIVEN_VALUE'),
  displayData: z.object({ error: z.string() }).nullish()
});

assertTypesEqual<
  BackendWrongGivenValueError,
  z.infer<typeof zBackendWrongGivenValueError>
>({ value: true });
