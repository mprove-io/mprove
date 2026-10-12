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
  type CalculateDiskShardError,
  zCalculateDiskShardError
} from '#common/types/backend/function-errors/calculate-disk-shard-error';
import {
  type RequestError,
  zRequestError
} from '#common/types/backend/function-errors/request-error';

export type SendToDiskError =
  | RequestError
  | BackendInvalidRequestError
  | CalculateDiskShardError
  | BackendErrorResponseFromDiskError;

export let zSendToDiskError = z.union([
  zRequestError,
  zBackendInvalidRequestError,
  zCalculateDiskShardError,
  zBackendErrorResponseFromDiskError
]);

assertTypesEqual<SendToDiskError, z.infer<typeof zSendToDiskError>>({
  value: true
});
