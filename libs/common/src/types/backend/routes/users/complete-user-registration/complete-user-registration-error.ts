import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendErrorResponseFromBlockmlError,
  zBackendErrorResponseFromBlockmlError
} from '#common/types/backend/errors/backend-error-response-from-blockml-error';
import {
  type BackendErrorResponseFromDiskError,
  zBackendErrorResponseFromDiskError
} from '#common/types/backend/errors/backend-error-response-from-disk-error';
import {
  type BackendHashSecretIsNotDefinedError,
  zBackendHashSecretIsNotDefinedError
} from '#common/types/backend/errors/backend-hash-secret-is-not-defined-error';
import {
  type BackendRpcInvalidResponseFormatError,
  zBackendRpcInvalidResponseFormatError
} from '#common/types/backend/errors/backend-rpc-invalid-response-format-error';
import {
  type BackendRpcTimeoutError,
  zBackendRpcTimeoutError
} from '#common/types/backend/errors/backend-rpc-timeout-error';
import {
  type BackendTransactionRetryError,
  zBackendTransactionRetryError
} from '#common/types/backend/errors/backend-transaction-retry-error';
import {
  type BackendUserAlreadyRegisteredError,
  zBackendUserAlreadyRegisteredError
} from '#common/types/backend/errors/backend-user-already-registered-error';
import {
  type BackendWrongTotalDiskShardsError,
  zBackendWrongTotalDiskShardsError
} from '#common/types/backend/errors/backend-wrong-total-disk-shards-error';

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
