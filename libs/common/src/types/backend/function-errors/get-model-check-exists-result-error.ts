import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendModelDoesNotExistError,
  zBackendModelDoesNotExistError
} from '#common/types/backend/errors/backend-model-does-not-exist-error';
import {
  type ModelEntToTabResultError,
  zModelEntToTabResultError
} from '#common/types/backend/function-errors/model-ent-to-tab-result-error';

export type GetModelCheckExistsResultError =
  | BackendModelDoesNotExistError
  | ModelEntToTabResultError;

export let zGetModelCheckExistsResultError = z.union([
  zBackendModelDoesNotExistError,
  zModelEntToTabResultError
]);

assertTypesEqual<
  GetModelCheckExistsResultError,
  z.infer<typeof zGetModelCheckExistsResultError>
>({ value: true });
