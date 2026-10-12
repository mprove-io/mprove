import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendErrorResponseFromBlockmlError,
  zBackendErrorResponseFromBlockmlError
} from '#common/types/backend/errors/backend-error-response-from-blockml-error';
import {
  type BackendInvalidRequestError,
  zBackendInvalidRequestError
} from '#common/types/backend/errors/backend-invalid-request-error';
import {
  type RequestError,
  zRequestError
} from '#common/types/backend/function-errors/request-error';

export type SendToBlockmlError =
  | RequestError
  | BackendInvalidRequestError
  | BackendErrorResponseFromBlockmlError;

export let zSendToBlockmlError = z.union([
  zRequestError,
  zBackendInvalidRequestError,
  zBackendErrorResponseFromBlockmlError
]);

assertTypesEqual<SendToBlockmlError, z.infer<typeof zSendToBlockmlError>>({
  value: true
});
