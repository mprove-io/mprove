import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendUconfigDoesNotExistError,
  zBackendUconfigDoesNotExistError
} from '#common/types/backend/errors/backend-uconfig-does-not-exist-error';
import {
  type UconfigEntToTabError,
  zUconfigEntToTabError
} from '#common/types/backend/function-errors/uconfig-ent-to-tab-error';

export type DbUconfigsFindFirstCheckExistsError =
  | UconfigEntToTabError
  | BackendUconfigDoesNotExistError;

export let zDbUconfigsFindFirstCheckExistsError = z.union([
  zUconfigEntToTabError,
  zBackendUconfigDoesNotExistError
]);

assertTypesEqual<
  DbUconfigsFindFirstCheckExistsError,
  z.infer<typeof zDbUconfigsFindFirstCheckExistsError>
>({
  value: true
});
