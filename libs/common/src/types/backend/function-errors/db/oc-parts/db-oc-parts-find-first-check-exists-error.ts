import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendOcPartDoesNotExistError,
  zBackendOcPartDoesNotExistError
} from '#common/types/backend/errors/backend-oc-part-does-not-exist-error';
import {
  type OcPartEntToTabError,
  zOcPartEntToTabError
} from '#common/types/backend/function-errors/oc-part-ent-to-tab-error';

export type DbOcPartsFindFirstCheckExistsError =
  | OcPartEntToTabError
  | BackendOcPartDoesNotExistError;

export let zDbOcPartsFindFirstCheckExistsError = z.union([
  zOcPartEntToTabError,
  zBackendOcPartDoesNotExistError
]);

assertTypesEqual<
  DbOcPartsFindFirstCheckExistsError,
  z.infer<typeof zDbOcPartsFindFirstCheckExistsError>
>({
  value: true
});
