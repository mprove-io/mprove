import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendUserProfileCodexAuthNotSetError,
  zBackendUserProfileCodexAuthNotSetError
} from '#common/types/backend/errors/backend-user-profile-codex-auth-not-set-error';
import {
  type GetUserCheckExistsError,
  zGetUserCheckExistsError
} from '#common/types/backend/function-errors/get-user-check-exists-error';

export type LoadAuthError =
  | GetUserCheckExistsError
  | BackendUserProfileCodexAuthNotSetError;

export let zLoadAuthError = z.union([
  zGetUserCheckExistsError,
  zBackendUserProfileCodexAuthNotSetError
]);

assertTypesEqual<LoadAuthError, z.infer<typeof zLoadAuthError>>({
  value: true
});
