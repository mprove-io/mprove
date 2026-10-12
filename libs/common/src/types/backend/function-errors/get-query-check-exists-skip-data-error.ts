import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendQueryDoesNotExistError,
  zBackendQueryDoesNotExistError
} from '#common/types/backend/errors/backend-query-does-not-exist-error';
import {
  type QueryEntToTabError,
  zQueryEntToTabError
} from '#common/types/backend/function-errors/query-ent-to-tab-error';

export type GetQueryCheckExistsSkipDataError =
  | BackendQueryDoesNotExistError
  | QueryEntToTabError;

export let zGetQueryCheckExistsSkipDataError = z.union([
  zBackendQueryDoesNotExistError,
  zQueryEntToTabError
]);

assertTypesEqual<
  GetQueryCheckExistsSkipDataError,
  z.infer<typeof zGetQueryCheckExistsSkipDataError>
>({ value: true });
