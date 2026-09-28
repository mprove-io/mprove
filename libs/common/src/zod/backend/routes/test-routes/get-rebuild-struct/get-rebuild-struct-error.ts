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
  type BackendProjectDoesNotExistError,
  zBackendProjectDoesNotExistError
} from '#common/zod/backend/errors/backend-project-does-not-exist-error';
import {
  type BackendRpcInvalidResponseFormatError,
  zBackendRpcInvalidResponseFormatError
} from '#common/zod/backend/errors/backend-rpc-invalid-response-format-error';
import {
  type BackendRpcTimeoutError,
  zBackendRpcTimeoutError
} from '#common/zod/backend/errors/backend-rpc-timeout-error';
import {
  type BackendWrongTotalDiskShardsError,
  zBackendWrongTotalDiskShardsError
} from '#common/zod/backend/errors/backend-wrong-total-disk-shards-error';

export type ToBackendGetRebuildStructError =
  | BackendErrorResponseFromBlockmlError
  | BackendErrorResponseFromDiskError
  | BackendProjectDoesNotExistError
  | BackendRpcInvalidResponseFormatError
  | BackendRpcTimeoutError
  | BackendWrongTotalDiskShardsError;

export let zToBackendGetRebuildStructError = z.discriminatedUnion('code', [
  zBackendErrorResponseFromBlockmlError,
  zBackendErrorResponseFromDiskError,
  zBackendProjectDoesNotExistError,
  zBackendRpcInvalidResponseFormatError,
  zBackendRpcTimeoutError,
  zBackendWrongTotalDiskShardsError
]);

assertTypesEqual<
  ToBackendGetRebuildStructError,
  z.infer<typeof zToBackendGetRebuildStructError>
>({ value: true });
