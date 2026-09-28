import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendHashSecretIsNotDefinedError,
  zBackendHashSecretIsNotDefinedError
} from '#common/zod/backend/errors/backend-hash-secret-is-not-defined-error';
import {
  type BackendRestrictedUserError,
  zBackendRestrictedUserError
} from '#common/zod/backend/errors/backend-restricted-user-error';
import {
  type BackendSignUpToSetPasswordError,
  zBackendSignUpToSetPasswordError
} from '#common/zod/backend/errors/backend-sign-up-to-set-password-error';
import {
  type BackendTransactionRetryError,
  zBackendTransactionRetryError
} from '#common/zod/backend/errors/backend-transaction-retry-error';

export type ToBackendResetUserPasswordError =
  | BackendHashSecretIsNotDefinedError
  | BackendRestrictedUserError
  | BackendSignUpToSetPasswordError
  | BackendTransactionRetryError;

export let zToBackendResetUserPasswordError = z.discriminatedUnion('code', [
  zBackendHashSecretIsNotDefinedError,
  zBackendRestrictedUserError,
  zBackendSignUpToSetPasswordError,
  zBackendTransactionRetryError
]);

assertTypesEqual<
  ToBackendResetUserPasswordError,
  z.infer<typeof zToBackendResetUserPasswordError>
>({ value: true });
