import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendModelDoesNotExistError,
  zBackendModelDoesNotExistError
} from '#common/types/backend/errors/backend-model-does-not-exist-error';
import {
  type ModelEntToTabError,
  zModelEntToTabError
} from '#common/types/backend/function-errors/model-ent-to-tab-error';

export type GetModelCheckExistsError =
  | BackendModelDoesNotExistError
  | ModelEntToTabError;

export let zGetModelCheckExistsError = z.union([
  zBackendModelDoesNotExistError,
  zModelEntToTabError
]);

assertTypesEqual<
  GetModelCheckExistsError,
  z.infer<typeof zGetModelCheckExistsError>
>({ value: true });
