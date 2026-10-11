import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendQueryDoesNotExistError,
  zBackendQueryDoesNotExistError
} from '#common/types/backend/errors/backend-query-does-not-exist-error';
import {
  type QueryEntToTabResultError,
  zQueryEntToTabResultError
} from '#common/types/backend/function-errors/query-ent-to-tab-result-error';

export type GetQueryCheckExistsSkipDataResultError =
  | BackendQueryDoesNotExistError
  | QueryEntToTabResultError;

export let zGetQueryCheckExistsSkipDataResultError = z.union([
  zBackendQueryDoesNotExistError,
  zQueryEntToTabResultError
]);

assertTypesEqual<
  GetQueryCheckExistsSkipDataResultError,
  z.infer<typeof zGetQueryCheckExistsSkipDataResultError>
>({ value: true });
