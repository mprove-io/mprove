import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendKitDoesNotExistError,
  zBackendKitDoesNotExistError
} from '#common/types/backend/errors/backend-kit-does-not-exist-error';
import {
  type KitEntToTabError,
  zKitEntToTabError
} from '#common/types/backend/function-errors/kit-ent-to-tab-error';

export type DbKitsFindFirstCheckExistsError =
  | KitEntToTabError
  | BackendKitDoesNotExistError;

export let zDbKitsFindFirstCheckExistsError = z.union([
  zKitEntToTabError,
  zBackendKitDoesNotExistError
]);

assertTypesEqual<
  DbKitsFindFirstCheckExistsError,
  z.infer<typeof zDbKitsFindFirstCheckExistsError>
>({
  value: true
});
