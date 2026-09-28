import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendFetchFkMysqlError = {
  code: 'BACKEND_FETCH_FK_MYSQL_ERROR';
};

export let zBackendFetchFkMysqlError = z.object({
  code: z.literal('BACKEND_FETCH_FK_MYSQL_ERROR')
});

assertTypesEqual<
  BackendFetchFkMysqlError,
  z.infer<typeof zBackendFetchFkMysqlError>
>({ value: true });
