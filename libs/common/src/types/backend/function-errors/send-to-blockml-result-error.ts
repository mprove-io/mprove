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
  type RequestResultError,
  zRequestResultError
} from '#common/types/backend/function-errors/request-result-error';

export type SendToBlockmlResultError =
  | RequestResultError
  | BackendInvalidRequestError
  | BackendErrorResponseFromBlockmlError;

export let zSendToBlockmlResultError = z.union([
  zRequestResultError,
  zBackendInvalidRequestError,
  zBackendErrorResponseFromBlockmlError
]);

assertTypesEqual<
  SendToBlockmlResultError,
  z.infer<typeof zSendToBlockmlResultError>
>({ value: true });
