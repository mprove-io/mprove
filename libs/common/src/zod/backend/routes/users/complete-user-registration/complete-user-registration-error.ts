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
  type BackendTransactionRetryError,
  zBackendTransactionRetryError
} from '#common/zod/backend/errors/backend-transaction-retry-error';
import {
  type BackendUserAlreadyRegisteredError,
  zBackendUserAlreadyRegisteredError
} from '#common/zod/backend/errors/backend-user-already-registered-error';
import {
  type BackendWrongTotalDiskShardsError,
  zBackendWrongTotalDiskShardsError
} from '#common/zod/backend/errors/backend-wrong-total-disk-shards-error';

export type ToBackendCompleteUserRegistrationError =
  | BackendErrorResponseFromBlockmlError
  | BackendErrorResponseFromDiskError
  | BackendHashSecretIsNotDefinedError
  | BackendRpcInvalidResponseFormatError
  | BackendRpcTimeoutError
  | BackendTransactionRetryError
  | BackendUserAlreadyRegisteredError
  | BackendWrongTotalDiskShardsError;

export let zToBackendCompleteUserRegistrationError = z.discriminatedUnion(
  'code',
  [
    zBackendErrorResponseFromBlockmlError,
    zBackendErrorResponseFromDiskError,
    zBackendHashSecretIsNotDefinedError,
    zBackendRpcInvalidResponseFormatError,
    zBackendRpcTimeoutError,
    zBackendTransactionRetryError,
    zBackendUserAlreadyRegisteredError,
    zBackendWrongTotalDiskShardsError
  ]
);

assertTypesEqual<
  ToBackendCompleteUserRegistrationError,
  z.infer<typeof zToBackendCompleteUserRegistrationError>
>({ value: true });
