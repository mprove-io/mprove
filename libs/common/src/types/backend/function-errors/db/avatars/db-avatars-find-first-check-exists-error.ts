import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendAvatarDoesNotExistError,
  zBackendAvatarDoesNotExistError
} from '#common/types/backend/errors/backend-avatar-does-not-exist-error';
import {
  type AvatarEntToTabError,
  zAvatarEntToTabError
} from '#common/types/backend/function-errors/avatar-ent-to-tab-error';

export type DbAvatarsFindFirstCheckExistsError =
  | AvatarEntToTabError
  | BackendAvatarDoesNotExistError;

export let zDbAvatarsFindFirstCheckExistsError = z.union([
  zAvatarEntToTabError,
  zBackendAvatarDoesNotExistError
]);

assertTypesEqual<
  DbAvatarsFindFirstCheckExistsError,
  z.infer<typeof zDbAvatarsFindFirstCheckExistsError>
>({
  value: true
});
