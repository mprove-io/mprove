import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendHashSecretIsNotDefinedError,
  zBackendHashSecretIsNotDefinedError
} from '#common/types/backend/errors/backend-hash-secret-is-not-defined-error';
import {
  type BackendRestrictedUserError,
  zBackendRestrictedUserError
} from '#common/types/backend/errors/backend-restricted-user-error';
import {
  type BackendTransactionRetryError,
  zBackendTransactionRetryError
} from '#common/types/backend/errors/backend-transaction-retry-error';

export type ToBackendSetUserNameError =
  | BackendHashSecretIsNotDefinedError
  | BackendRestrictedUserError
  | BackendTransactionRetryError;

export let zToBackendSetUserNameError = z.discriminatedUnion('code', [
  zBackendHashSecretIsNotDefinedError,
  zBackendRestrictedUserError,
  zBackendTransactionRetryError
]);

assertTypesEqual<
  ToBackendSetUserNameError,
  z.infer<typeof zToBackendSetUserNameError>
>({ value: true });
