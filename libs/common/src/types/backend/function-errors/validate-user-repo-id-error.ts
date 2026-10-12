import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendRepoIdDoesNotMatchUserError,
  zBackendRepoIdDoesNotMatchUserError
} from '#common/types/backend/errors/backend-repo-id-does-not-match-user-error';

export type ValidateUserRepoIdError = BackendRepoIdDoesNotMatchUserError;

export let zValidateUserRepoIdError = zBackendRepoIdDoesNotMatchUserError;

assertTypesEqual<
  ValidateUserRepoIdError,
  z.infer<typeof zValidateUserRepoIdError>
>({ value: true });
