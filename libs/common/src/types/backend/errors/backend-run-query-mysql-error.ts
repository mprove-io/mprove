import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendRunQueryMysqlError = {
  code: 'BACKEND_RUN_QUERY_MYSQL_ERROR';
};

export let zBackendRunQueryMysqlError = z.object({
  code: z.literal('BACKEND_RUN_QUERY_MYSQL_ERROR')
});

assertTypesEqual<
  BackendRunQueryMysqlError,
  z.infer<typeof zBackendRunQueryMysqlError>
>({ value: true });
