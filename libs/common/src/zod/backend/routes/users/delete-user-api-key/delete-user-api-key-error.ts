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
  type BackendTransactionRetryError,
  zBackendTransactionRetryError
} from '#common/zod/backend/errors/backend-transaction-retry-error';

export type ToBackendDeleteUserApiKeyError =
  | BackendHashSecretIsNotDefinedError
  | BackendRestrictedUserError
  | BackendTransactionRetryError;

export let zToBackendDeleteUserApiKeyError = z.discriminatedUnion('code', [
  zBackendHashSecretIsNotDefinedError,
  zBackendRestrictedUserError,
  zBackendTransactionRetryError
]);

assertTypesEqual<
  ToBackendDeleteUserApiKeyError,
  z.infer<typeof zToBackendDeleteUserApiKeyError>
>({ value: true });
