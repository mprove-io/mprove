import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendErrorResponseFromBlockmlError,
  zBackendErrorResponseFromBlockmlError
} from '#common/zod/backend/errors/backend-error-response-from-blockml-error';
import {
  type BackendErrorResponseFromDiskError,
  zBackendErrorResponseFromDiskError
} from '#common/zod/backend/errors/backend-error-response-from-disk-error';
import {
  type BackendHashSecretIsNotDefinedError,
  zBackendHashSecretIsNotDefinedError
} from '#common/zod/backend/errors/backend-hash-secret-is-not-defined-error';
import {
  type BackendRpcInvalidResponseFormatError,
  zBackendRpcInvalidResponseFormatError
} from '#common/zod/backend/errors/backend-rpc-invalid-response-format-error';
import {
  type BackendRpcTimeoutError,
  zBackendRpcTimeoutError
} from '#common/zod/backend/errors/backend-rpc-timeout-error';
import {
  type BackendSignUpToSetPasswordError,
  zBackendSignUpToSetPasswordError
} from '#common/zod/backend/errors/backend-sign-up-to-set-password-error';
import {
  type BackendTransactionRetryError,
  zBackendTransactionRetryError
} from '#common/zod/backend/errors/backend-transaction-retry-error';
import {
  type BackendWrongTotalDiskShardsError,
  zBackendWrongTotalDiskShardsError
} from '#common/zod/backend/errors/backend-wrong-total-disk-shards-error';

export type ToBackendConfirmUserEmailError =
  | BackendErrorResponseFromBlockmlError
  | BackendErrorResponseFromDiskError
  | BackendHashSecretIsNotDefinedError
  | BackendRpcInvalidResponseFormatError
  | BackendRpcTimeoutError
  | BackendSignUpToSetPasswordError
  | BackendTransactionRetryError
  | BackendWrongTotalDiskShardsError;

export let zToBackendConfirmUserEmailError = z.discriminatedUnion('code', [
  zBackendErrorResponseFromBlockmlError,
  zBackendErrorResponseFromDiskError,
  zBackendHashSecretIsNotDefinedError,
  zBackendRpcInvalidResponseFormatError,
  zBackendRpcTimeoutError,
  zBackendSignUpToSetPasswordError,
  zBackendTransactionRetryError,
  zBackendWrongTotalDiskShardsError
]);

assertTypesEqual<
  ToBackendConfirmUserEmailError,
  z.infer<typeof zToBackendConfirmUserEmailError>
>({ value: true });
