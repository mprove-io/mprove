import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendSignUpToSetPasswordError,
  zBackendSignUpToSetPasswordError
} from '#common/types/backend/errors/backend-sign-up-to-set-password-error';

export type CheckUserPasswordHashIsDefinedError =
  BackendSignUpToSetPasswordError;

export const zCheckUserPasswordHashIsDefinedError =
  zBackendSignUpToSetPasswordError;

assertTypesEqual<
  CheckUserPasswordHashIsDefinedError,
  z.infer<typeof zCheckUserPasswordHashIsDefinedError>
>({ value: true });
