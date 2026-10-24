import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendRepoIdDoesNotMatchUserError,
  zBackendRepoIdDoesNotMatchUserError
} from '#common/types/backend/errors/backend-repo-id-does-not-match-user-error';

export type ValidateMcpUserRepoIdError = BackendRepoIdDoesNotMatchUserError;

export let zValidateMcpUserRepoIdError = zBackendRepoIdDoesNotMatchUserError;

assertTypesEqual<
  ValidateMcpUserRepoIdError,
  z.infer<typeof zValidateMcpUserRepoIdError>
>({ value: true });
