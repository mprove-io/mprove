import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendFetchFkPostgresError = {
  code: 'BACKEND_FETCH_FK_POSTGRES_ERROR';
};

export let zBackendFetchFkPostgresError = z.object({
  code: z.literal('BACKEND_FETCH_FK_POSTGRES_ERROR')
});

assertTypesEqual<
  BackendFetchFkPostgresError,
  z.infer<typeof zBackendFetchFkPostgresError>
>({ value: true });
