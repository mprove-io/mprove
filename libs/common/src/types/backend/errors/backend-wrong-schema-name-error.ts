import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendWrongSchemaNameError = {
  code: 'BACKEND_WRONG_SCHEMA_NAME';
};

export let zBackendWrongSchemaNameError = z.object({
  code: z.literal('BACKEND_WRONG_SCHEMA_NAME')
});

assertTypesEqual<
  BackendWrongSchemaNameError,
  z.infer<typeof zBackendWrongSchemaNameError>
>({ value: true });
