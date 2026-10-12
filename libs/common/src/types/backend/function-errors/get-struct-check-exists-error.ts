import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendStructDoesNotExistError,
  zBackendStructDoesNotExistError
} from '#common/types/backend/errors/backend-struct-does-not-exist-error';
import {
  type StructEntToTabError,
  zStructEntToTabError
} from '#common/types/backend/function-errors/struct-ent-to-tab-error';

export type GetStructCheckExistsError =
  | BackendStructDoesNotExistError
  | StructEntToTabError;

export let zGetStructCheckExistsError = z.union([
  zBackendStructDoesNotExistError,
  zStructEntToTabError
]);

assertTypesEqual<
  GetStructCheckExistsError,
  z.infer<typeof zGetStructCheckExistsError>
>({ value: true });
