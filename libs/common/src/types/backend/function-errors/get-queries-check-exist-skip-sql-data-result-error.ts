import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendQueriesDoNotExistError,
  zBackendQueriesDoNotExistError
} from '#common/types/backend/errors/backend-queries-do-not-exist-error';
import {
  type QueryEntToTabResultError,
  zQueryEntToTabResultError
} from '#common/types/backend/function-errors/query-ent-to-tab-result-error';

export type GetQueriesCheckExistSkipSqlDataResultError =
  | BackendQueriesDoNotExistError
  | QueryEntToTabResultError;

export let zGetQueriesCheckExistSkipSqlDataResultError = z.union([
  zBackendQueriesDoNotExistError,
  zQueryEntToTabResultError
]);

assertTypesEqual<
  GetQueriesCheckExistSkipSqlDataResultError,
  z.infer<typeof zGetQueriesCheckExistSkipSqlDataResultError>
>({ value: true });
