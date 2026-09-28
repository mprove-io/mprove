import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendConnectionSchemaIsNotFoundError = {
  code: 'BACKEND_CONNECTION_SCHEMA_IS_NOT_FOUND';
};

export let zBackendConnectionSchemaIsNotFoundError = z.object({
  code: z.literal('BACKEND_CONNECTION_SCHEMA_IS_NOT_FOUND')
});

assertTypesEqual<
  BackendConnectionSchemaIsNotFoundError,
  z.infer<typeof zBackendConnectionSchemaIsNotFoundError>
>({ value: true });
