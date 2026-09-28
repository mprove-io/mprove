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

export type ToBackendDeleteUserCodexAuthError =
  | BackendHashSecretIsNotDefinedError
  | BackendRestrictedUserError
  | BackendTransactionRetryError;

export let zToBackendDeleteUserCodexAuthError = z.discriminatedUnion('code', [
  zBackendHashSecretIsNotDefinedError,
  zBackendRestrictedUserError,
  zBackendTransactionRetryError
]);

assertTypesEqual<
  ToBackendDeleteUserCodexAuthError,
  z.infer<typeof zToBackendDeleteUserCodexAuthError>
>({ value: true });
