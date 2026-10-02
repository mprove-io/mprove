import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendHashSecretIsNotDefinedError,
  zBackendHashSecretIsNotDefinedError
} from '#common/types/backend/errors/backend-hash-secret-is-not-defined-error';
import {
  type BackendTransactionRetryError,
  zBackendTransactionRetryError
} from '#common/types/backend/errors/backend-transaction-retry-error';
import {
  type BackendUpdatePasswordTokenExpiredError,
  zBackendUpdatePasswordTokenExpiredError
} from '#common/types/backend/errors/backend-update-password-token-expired-error';
import {
  type BackendUpdatePasswordWrongTokenError,
  zBackendUpdatePasswordWrongTokenError
} from '#common/types/backend/errors/backend-update-password-wrong-token-error';

export type ToBackendUpdateUserPasswordError =
  | BackendHashSecretIsNotDefinedError
  | BackendTransactionRetryError
  | BackendUpdatePasswordTokenExpiredError
  | BackendUpdatePasswordWrongTokenError;

export let zToBackendUpdateUserPasswordError = z.discriminatedUnion('code', [
  zBackendHashSecretIsNotDefinedError,
  zBackendTransactionRetryError,
  zBackendUpdatePasswordTokenExpiredError,
  zBackendUpdatePasswordWrongTokenError
]);

assertTypesEqual<
  ToBackendUpdateUserPasswordError,
  z.infer<typeof zToBackendUpdateUserPasswordError>
>({ value: true });
