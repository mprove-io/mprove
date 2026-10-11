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

export type GetQueriesCheckExistResultError =
  | BackendQueriesDoNotExistError
  | QueryEntToTabResultError;

export let zGetQueriesCheckExistResultError = z.union([
  zBackendQueriesDoNotExistError,
  zQueryEntToTabResultError
]);

assertTypesEqual<
  GetQueriesCheckExistResultError,
  z.infer<typeof zGetQueriesCheckExistResultError>
>({ value: true });
