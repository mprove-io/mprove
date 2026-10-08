import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendRpcInvalidResponseFormatError,
  zBackendRpcInvalidResponseFormatError
} from '#common/types/backend/errors/backend-rpc-invalid-response-format-error';
import {
  type BackendRpcTimeoutError,
  zBackendRpcTimeoutError
} from '#common/types/backend/errors/backend-rpc-timeout-error';

export type RequestResultError =
  | BackendRpcTimeoutError
  | BackendRpcInvalidResponseFormatError;

export let zRequestResultError = z.union([
  zBackendRpcTimeoutError,
  zBackendRpcInvalidResponseFormatError
]);

assertTypesEqual<RequestResultError, z.infer<typeof zRequestResultError>>({
  value: true
});
