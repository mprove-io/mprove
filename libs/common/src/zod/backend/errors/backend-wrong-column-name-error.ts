import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendWrongColumnNameError = {
  code: 'BACKEND_WRONG_COLUMN_NAME';
};

export let zBackendWrongColumnNameError = z.object({
  code: z.literal('BACKEND_WRONG_COLUMN_NAME')
});

assertTypesEqual<
  BackendWrongColumnNameError,
  z.infer<typeof zBackendWrongColumnNameError>
>({ value: true });
