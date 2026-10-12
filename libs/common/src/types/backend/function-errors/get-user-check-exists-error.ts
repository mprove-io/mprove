import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendUserDoesNotExistError,
  zBackendUserDoesNotExistError
} from '#common/types/backend/errors/backend-user-does-not-exist-error';
import {
  type UserEntToTabError,
  zUserEntToTabError
} from '#common/types/backend/function-errors/user-ent-to-tab-error';

export type GetUserCheckExistsError =
  | UserEntToTabError
  | BackendUserDoesNotExistError;

export const zGetUserCheckExistsError = z.union([
  zUserEntToTabError,
  zBackendUserDoesNotExistError
]);

assertTypesEqual<
  GetUserCheckExistsError,
  z.infer<typeof zGetUserCheckExistsError>
>({ value: true });
