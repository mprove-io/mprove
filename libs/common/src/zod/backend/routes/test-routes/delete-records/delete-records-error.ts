import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
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
  type BackendWrongTotalDiskShardsError,
  zBackendWrongTotalDiskShardsError
} from '#common/zod/backend/errors/backend-wrong-total-disk-shards-error';

export type ToBackendDeleteRecordsError =
  | BackendErrorResponseFromDiskError
  | BackendHashSecretIsNotDefinedError
  | BackendRpcInvalidResponseFormatError
  | BackendRpcTimeoutError
  | BackendTransactionRetryError
  | BackendWrongTotalDiskShardsError;

export let zToBackendDeleteRecordsError = z.discriminatedUnion('code', [
  zBackendErrorResponseFromDiskError,
  zBackendHashSecretIsNotDefinedError,
  zBackendRpcInvalidResponseFormatError,
  zBackendRpcTimeoutError,
  zBackendTransactionRetryError,
  zBackendWrongTotalDiskShardsError
]);

assertTypesEqual<
  ToBackendDeleteRecordsError,
  z.infer<typeof zToBackendDeleteRecordsError>
>({ value: true });
