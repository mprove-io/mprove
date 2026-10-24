import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendRepoIdDoesNotMatchSessionError,
  zBackendRepoIdDoesNotMatchSessionError
} from '#common/types/backend/errors/backend-repo-id-does-not-match-session-error';

export type ValidateMcpSessionRepoIdError =
  BackendRepoIdDoesNotMatchSessionError;

export let zValidateMcpSessionRepoIdError =
  zBackendRepoIdDoesNotMatchSessionError;

assertTypesEqual<
  ValidateMcpSessionRepoIdError,
  z.infer<typeof zValidateMcpSessionRepoIdError>
>({ value: true });
