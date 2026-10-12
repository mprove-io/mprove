import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendRepoIdDoesNotMatchSessionError,
  zBackendRepoIdDoesNotMatchSessionError
} from '#common/types/backend/errors/backend-repo-id-does-not-match-session-error';

export type ValidateSessionRepoIdError = BackendRepoIdDoesNotMatchSessionError;

export let zValidateSessionRepoIdError = zBackendRepoIdDoesNotMatchSessionError;

assertTypesEqual<
  ValidateSessionRepoIdError,
  z.infer<typeof zValidateSessionRepoIdError>
>({ value: true });
