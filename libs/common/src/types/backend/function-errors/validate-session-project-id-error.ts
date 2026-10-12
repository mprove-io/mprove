import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendProjectIdDoesNotMatchSessionError,
  zBackendProjectIdDoesNotMatchSessionError
} from '#common/types/backend/errors/backend-project-id-does-not-match-session-error';

export type ValidateSessionProjectIdError =
  BackendProjectIdDoesNotMatchSessionError;

export let zValidateSessionProjectIdError =
  zBackendProjectIdDoesNotMatchSessionError;

assertTypesEqual<
  ValidateSessionProjectIdError,
  z.infer<typeof zValidateSessionProjectIdError>
>({ value: true });
