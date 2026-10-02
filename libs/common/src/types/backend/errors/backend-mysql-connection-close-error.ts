import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendMysqlConnectionCloseError = {
  code: 'BACKEND_MYSQL_CONNECTION_CLOSE_ERROR';
};

export let zBackendMysqlConnectionCloseError = z.object({
  code: z.literal('BACKEND_MYSQL_CONNECTION_CLOSE_ERROR')
});

assertTypesEqual<
  BackendMysqlConnectionCloseError,
  z.infer<typeof zBackendMysqlConnectionCloseError>
>({ value: true });
