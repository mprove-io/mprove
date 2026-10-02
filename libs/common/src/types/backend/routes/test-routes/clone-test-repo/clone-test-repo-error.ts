import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendErrorResponseFromDiskError,
  zBackendErrorResponseFromDiskError
} from '#common/types/backend/errors/backend-error-response-from-disk-error';
import {
  type BackendRpcInvalidResponseFormatError,
  zBackendRpcInvalidResponseFormatError
} from '#common/types/backend/errors/backend-rpc-invalid-response-format-error';
import {
  type BackendRpcTimeoutError,
  zBackendRpcTimeoutError
} from '#common/types/backend/errors/backend-rpc-timeout-error';
import {
  type BackendWrongTotalDiskShardsError,
  zBackendWrongTotalDiskShardsError
} from '#common/types/backend/errors/backend-wrong-total-disk-shards-error';

export type ToBackendCloneTestRepoError =
  | BackendErrorResponseFromDiskError
  | BackendRpcInvalidResponseFormatError
  | BackendRpcTimeoutError
  | BackendWrongTotalDiskShardsError;

export let zToBackendCloneTestRepoError = z.discriminatedUnion('code', [
  zBackendErrorResponseFromDiskError,
  zBackendRpcInvalidResponseFormatError,
  zBackendRpcTimeoutError,
  zBackendWrongTotalDiskShardsError
]);

assertTypesEqual<
  ToBackendCloneTestRepoError,
  z.infer<typeof zToBackendCloneTestRepoError>
>({ value: true });
