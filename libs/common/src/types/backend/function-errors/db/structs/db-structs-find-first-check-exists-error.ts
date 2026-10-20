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

export type DbStructsFindFirstCheckExistsError =
  | StructEntToTabError
  | BackendStructDoesNotExistError;

export let zDbStructsFindFirstCheckExistsError = z.union([
  zStructEntToTabError,
  zBackendStructDoesNotExistError
]);

assertTypesEqual<
  DbStructsFindFirstCheckExistsError,
  z.infer<typeof zDbStructsFindFirstCheckExistsError>
>({
  value: true
});
