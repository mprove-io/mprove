import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendWrongTableNameError = {
  code: 'BACKEND_WRONG_TABLE_NAME';
};

export let zBackendWrongTableNameError = z.object({
  code: z.literal('BACKEND_WRONG_TABLE_NAME')
});

assertTypesEqual<
  BackendWrongTableNameError,
  z.infer<typeof zBackendWrongTableNameError>
>({ value: true });
