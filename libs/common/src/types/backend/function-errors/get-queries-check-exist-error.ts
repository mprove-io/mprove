import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendQueriesDoNotExistError,
  zBackendQueriesDoNotExistError
} from '#common/types/backend/errors/backend-queries-do-not-exist-error';
import {
  type DbQueriesFindManyError,
  zDbQueriesFindManyError
} from '#common/types/backend/function-errors/db/queries/db-queries-find-many-error';

export type GetQueriesCheckExistError =
  | BackendQueriesDoNotExistError
  | DbQueriesFindManyError;

export let zGetQueriesCheckExistError = z.union([
  zBackendQueriesDoNotExistError,
  zDbQueriesFindManyError
]);

assertTypesEqual<
  GetQueriesCheckExistError,
  z.infer<typeof zGetQueriesCheckExistError>
>({ value: true });
