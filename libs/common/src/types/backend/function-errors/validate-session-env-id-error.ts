import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendEnvIdDoesNotMatchSessionError,
  zBackendEnvIdDoesNotMatchSessionError
} from '#common/types/backend/errors/backend-env-id-does-not-match-session-error';

export type ValidateSessionEnvIdError = BackendEnvIdDoesNotMatchSessionError;

export let zValidateSessionEnvIdError = zBackendEnvIdDoesNotMatchSessionError;

assertTypesEqual<
  ValidateSessionEnvIdError,
  z.infer<typeof zValidateSessionEnvIdError>
>({ value: true });
