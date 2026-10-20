import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendMconfigDoesNotExistError,
  zBackendMconfigDoesNotExistError
} from '#common/types/backend/errors/backend-mconfig-does-not-exist-error';
import {
  type MconfigEntToTabError,
  zMconfigEntToTabError
} from '#common/types/backend/function-errors/mconfig-ent-to-tab-error';

export type DbMconfigsFindFirstCheckExistsError =
  | MconfigEntToTabError
  | BackendMconfigDoesNotExistError;

export let zDbMconfigsFindFirstCheckExistsError = z.union([
  zMconfigEntToTabError,
  zBackendMconfigDoesNotExistError
]);

assertTypesEqual<
  DbMconfigsFindFirstCheckExistsError,
  z.infer<typeof zDbMconfigsFindFirstCheckExistsError>
>({
  value: true
});
