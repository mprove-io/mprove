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

export type CheckRepoIdResultError =
  | BackendForbiddenRepoIdError
  | BackendProductionRepoNotAllowedError;

export let zCheckRepoIdResultError = z.union([
  zBackendForbiddenRepoIdError,
  zBackendProductionRepoNotAllowedError
]);

assertTypesEqual<
  CheckRepoIdResultError,
  z.infer<typeof zCheckRepoIdResultError>
>({ value: true });
