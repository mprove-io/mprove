import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendErrorResponseFromDiskError,
  zBackendErrorResponseFromDiskError
} from '#common/types/backend/errors/backend-error-response-from-disk-error';
import {
  type BackendInvalidRequestError,
  zBackendInvalidRequestError
} from '#common/types/backend/errors/backend-invalid-request-error';
import {
  type CalculateDiskShardResultError,
  zCalculateDiskShardResultError
} from '#common/types/backend/function-errors/calculate-disk-shard-result-error';
import {
  type RequestResultError,
  zRequestResultError
} from '#common/types/backend/function-errors/request-result-error';

export type SendToDiskResultError =
  | RequestResultError
  | BackendInvalidRequestError
  | CalculateDiskShardResultError
  | BackendErrorResponseFromDiskError;

export let zSendToDiskResultError = z.union([
  zRequestResultError,
  zBackendInvalidRequestError,
  zCalculateDiskShardResultError,
  zBackendErrorResponseFromDiskError
]);

assertTypesEqual<SendToDiskResultError, z.infer<typeof zSendToDiskResultError>>(
  { value: true }
);
