import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendDconfigDoesNotExistError,
  zBackendDconfigDoesNotExistError
} from '#common/types/backend/errors/backend-dconfig-does-not-exist-error';
import {
  type DconfigEntToTabError,
  zDconfigEntToTabError
} from '#common/types/backend/function-errors/dconfig-ent-to-tab-error';

export type DbDconfigsFindFirstCheckExistsError =
  | DconfigEntToTabError
  | BackendDconfigDoesNotExistError;

export let zDbDconfigsFindFirstCheckExistsError = z.union([
  zDconfigEntToTabError,
  zBackendDconfigDoesNotExistError
]);

assertTypesEqual<
  DbDconfigsFindFirstCheckExistsError,
  z.infer<typeof zDbDconfigsFindFirstCheckExistsError>
>({
  value: true
});
