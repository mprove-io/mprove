import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendForbiddenRepoIdError,
  zBackendForbiddenRepoIdError
} from '#common/types/backend/errors/backend-forbidden-repo-id-error';
import {
  type BackendProductionRepoNotAllowedError,
  zBackendProductionRepoNotAllowedError
} from '#common/types/backend/errors/backend-production-repo-not-allowed-error';

export type CheckRepoIdError =
  | BackendForbiddenRepoIdError
  | BackendProductionRepoNotAllowedError;

export let zCheckRepoIdError = z.union([
  zBackendForbiddenRepoIdError,
  zBackendProductionRepoNotAllowedError
]);

assertTypesEqual<CheckRepoIdError, z.infer<typeof zCheckRepoIdError>>({
  value: true
});
