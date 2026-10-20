import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendOcSessionDoesNotExistError,
  zBackendOcSessionDoesNotExistError
} from '#common/types/backend/errors/backend-oc-session-does-not-exist-error';
import {
  type OcSessionEntToTabError,
  zOcSessionEntToTabError
} from '#common/types/backend/function-errors/oc-session-ent-to-tab-error';

export type DbOcSessionsFindFirstCheckExistsError =
  | OcSessionEntToTabError
  | BackendOcSessionDoesNotExistError;

export let zDbOcSessionsFindFirstCheckExistsError = z.union([
  zOcSessionEntToTabError,
  zBackendOcSessionDoesNotExistError
]);

assertTypesEqual<
  DbOcSessionsFindFirstCheckExistsError,
  z.infer<typeof zDbOcSessionsFindFirstCheckExistsError>
>({
  value: true
});
