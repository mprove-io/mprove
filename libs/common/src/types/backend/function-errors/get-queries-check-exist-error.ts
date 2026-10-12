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

export type GetQueriesCheckExistError =
  | BackendQueriesDoNotExistError
  | QueryEntToTabError;

export let zGetQueriesCheckExistError = z.union([
  zBackendQueriesDoNotExistError,
  zQueryEntToTabError
]);

assertTypesEqual<
  GetQueriesCheckExistError,
  z.infer<typeof zGetQueriesCheckExistError>
>({ value: true });
