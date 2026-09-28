import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendEditorSessionLockFailedError,
  zBackendEditorSessionLockFailedError
} from '#common/zod/backend/errors/backend-editor-session-lock-failed-error';
import {
  type BackendErrorResponseFromDiskError,
  zBackendErrorResponseFromDiskError
} from '#common/zod/backend/errors/backend-error-response-from-disk-error';
import {
  type BackendHashSecretIsNotDefinedError,
  zBackendHashSecretIsNotDefinedError
} from '#common/zod/backend/errors/backend-hash-secret-is-not-defined-error';
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
  type BackendSessionNotFoundError,
  zBackendSessionNotFoundError
} from '#common/zod/backend/errors/backend-session-not-found-error';
import {
  type BackendTransactionRetryError,
  zBackendTransactionRetryError
} from '#common/zod/backend/errors/backend-transaction-retry-error';
import {
  type BackendUnknownSandboxTypeError,
  zBackendUnknownSandboxTypeError
} from '#common/zod/backend/errors/backend-unknown-sandbox-type-error';
import {
  type BackendWrongTotalDiskShardsError,
  zBackendWrongTotalDiskShardsError
} from '#common/zod/backend/errors/backend-wrong-total-disk-shards-error';

export type ToBackendDeleteSessionError =
  | BackendEditorSessionLockFailedError
  | BackendErrorResponseFromDiskError
  | BackendHashSecretIsNotDefinedError
  | BackendProjectDoesNotExistError
  | BackendRpcInvalidResponseFormatError
  | BackendRpcTimeoutError
  | BackendSessionNotFoundError
  | BackendTransactionRetryError
  | BackendUnknownSandboxTypeError
  | BackendWrongTotalDiskShardsError;

export let zToBackendDeleteSessionError = z.discriminatedUnion('code', [
  zBackendEditorSessionLockFailedError,
  zBackendErrorResponseFromDiskError,
  zBackendHashSecretIsNotDefinedError,
  zBackendProjectDoesNotExistError,
  zBackendRpcInvalidResponseFormatError,
  zBackendRpcTimeoutError,
  zBackendSessionNotFoundError,
  zBackendTransactionRetryError,
  zBackendUnknownSandboxTypeError,
  zBackendWrongTotalDiskShardsError
]);

assertTypesEqual<
  ToBackendDeleteSessionError,
  z.infer<typeof zToBackendDeleteSessionError>
>({ value: true });
