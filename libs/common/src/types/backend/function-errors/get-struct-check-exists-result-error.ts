import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendStructDoesNotExistError,
  zBackendStructDoesNotExistError
} from '#common/types/backend/errors/backend-struct-does-not-exist-error';
import {
  type StructEntToTabResultError,
  zStructEntToTabResultError
} from '#common/types/backend/function-errors/struct-ent-to-tab-result-error';

export type GetStructCheckExistsResultError =
  | BackendStructDoesNotExistError
  | StructEntToTabResultError;

export let zGetStructCheckExistsResultError = z.union([
  zBackendStructDoesNotExistError,
  zStructEntToTabResultError
]);

assertTypesEqual<
  GetStructCheckExistsResultError,
  z.infer<typeof zGetStructCheckExistsResultError>
>({ value: true });
