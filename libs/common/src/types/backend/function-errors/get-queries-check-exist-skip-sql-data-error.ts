import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendQueriesDoNotExistError,
  zBackendQueriesDoNotExistError
} from '#common/types/backend/errors/backend-queries-do-not-exist-error';
import {
  type QueryEntToTabError,
  zQueryEntToTabError
} from '#common/types/backend/function-errors/query-ent-to-tab-error';

export type GetQueriesCheckExistSkipSqlDataError =
  | BackendQueriesDoNotExistError
  | QueryEntToTabError;

export let zGetQueriesCheckExistSkipSqlDataError = z.union([
  zBackendQueriesDoNotExistError,
  zQueryEntToTabError
]);

assertTypesEqual<
  GetQueriesCheckExistSkipSqlDataError,
  z.infer<typeof zGetQueriesCheckExistSkipSqlDataError>
>({ value: true });
