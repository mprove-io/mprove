import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendProjectIdDoesNotMatchSessionError,
  zBackendProjectIdDoesNotMatchSessionError
} from '#common/types/backend/errors/backend-project-id-does-not-match-session-error';

export type ValidateMcpSessionProjectIdError =
  BackendProjectIdDoesNotMatchSessionError;

export let zValidateMcpSessionProjectIdError =
  zBackendProjectIdDoesNotMatchSessionError;

assertTypesEqual<
  ValidateMcpSessionProjectIdError,
  z.infer<typeof zValidateMcpSessionProjectIdError>
>({ value: true });
