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

export type LoadCodexAuthError =
  | GetUserCheckExistsError
  | BackendUserProfileCodexAuthNotSetError;

export let zLoadCodexAuthError = z.union([
  zGetUserCheckExistsError,
  zBackendUserProfileCodexAuthNotSetError
]);

assertTypesEqual<LoadCodexAuthError, z.infer<typeof zLoadCodexAuthError>>({
  value: true
});
