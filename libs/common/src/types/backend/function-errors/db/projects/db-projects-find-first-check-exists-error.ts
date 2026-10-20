import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendProjectDoesNotExistError,
  zBackendProjectDoesNotExistError
} from '#common/types/backend/errors/backend-project-does-not-exist-error';
import {
  type ProjectEntToTabError,
  zProjectEntToTabError
} from '#common/types/backend/function-errors/project-ent-to-tab-error';

export type DbProjectsFindFirstCheckExistsError =
  | ProjectEntToTabError
  | BackendProjectDoesNotExistError;

export let zDbProjectsFindFirstCheckExistsError = z.union([
  zProjectEntToTabError,
  zBackendProjectDoesNotExistError
]);

assertTypesEqual<
  DbProjectsFindFirstCheckExistsError,
  z.infer<typeof zDbProjectsFindFirstCheckExistsError>
>({
  value: true
});
