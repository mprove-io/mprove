import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendHashSecretIsNotDefinedError,
  zBackendHashSecretIsNotDefinedError
} from '#common/zod/backend/errors/backend-hash-secret-is-not-defined-error';
import {
  type BackendTransactionRetryError,
  zBackendTransactionRetryError
} from '#common/zod/backend/errors/backend-transaction-retry-error';

export type ToBackendSetUserUiError =
  | BackendHashSecretIsNotDefinedError
  | BackendTransactionRetryError;

export let zToBackendSetUserUiError = z.discriminatedUnion('code', [
  zBackendHashSecretIsNotDefinedError,
  zBackendTransactionRetryError
]);

assertTypesEqual<
  ToBackendSetUserUiError,
  z.infer<typeof zToBackendSetUserUiError>
>({ value: true });
