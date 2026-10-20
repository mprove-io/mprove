import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendOcMessageDoesNotExistError,
  zBackendOcMessageDoesNotExistError
} from '#common/types/backend/errors/backend-oc-message-does-not-exist-error';
import {
  type OcMessageEntToTabError,
  zOcMessageEntToTabError
} from '#common/types/backend/function-errors/oc-message-ent-to-tab-error';

export type DbOcMessagesFindFirstCheckExistsError =
  | OcMessageEntToTabError
  | BackendOcMessageDoesNotExistError;

export let zDbOcMessagesFindFirstCheckExistsError = z.union([
  zOcMessageEntToTabError,
  zBackendOcMessageDoesNotExistError
]);

assertTypesEqual<
  DbOcMessagesFindFirstCheckExistsError,
  z.infer<typeof zDbOcMessagesFindFirstCheckExistsError>
>({
  value: true
});
