import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendEnvIdDoesNotMatchSessionError,
  zBackendEnvIdDoesNotMatchSessionError
} from '#common/types/backend/errors/backend-env-id-does-not-match-session-error';

export type ValidateMcpEnvAccessError = BackendEnvIdDoesNotMatchSessionError;

export let zValidateMcpEnvAccessError = zBackendEnvIdDoesNotMatchSessionError;

assertTypesEqual<
  ValidateMcpEnvAccessError,
  z.infer<typeof zValidateMcpEnvAccessError>
>({ value: true });
