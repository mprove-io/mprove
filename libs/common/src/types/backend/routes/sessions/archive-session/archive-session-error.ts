import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendEditorSessionLockFailedError,
  zBackendEditorSessionLockFailedError
} from '#common/types/backend/errors/backend-editor-session-lock-failed-error';
import {
  type BackendHashSecretIsNotDefinedError,
  zBackendHashSecretIsNotDefinedError
} from '#common/types/backend/errors/backend-hash-secret-is-not-defined-error';
import {
  type BackendProjectDoesNotExistError,
  zBackendProjectDoesNotExistError
} from '#common/types/backend/errors/backend-project-does-not-exist-error';
import {
  type BackendSessionNotFoundError,
  zBackendSessionNotFoundError
} from '#common/types/backend/errors/backend-session-not-found-error';
import {
  type BackendSessionTypeIsNotEditorError,
  zBackendSessionTypeIsNotEditorError
} from '#common/types/backend/errors/backend-session-type-is-not-editor-error';
import {
  type BackendTransactionRetryError,
  zBackendTransactionRetryError
} from '#common/types/backend/errors/backend-transaction-retry-error';
import {
  type BackendUnknownSandboxTypeError,
  zBackendUnknownSandboxTypeError
} from '#common/types/backend/errors/backend-unknown-sandbox-type-error';

export type ToBackendArchiveSessionError =
  | BackendEditorSessionLockFailedError
  | BackendHashSecretIsNotDefinedError
  | BackendProjectDoesNotExistError
  | BackendSessionNotFoundError
  | BackendSessionTypeIsNotEditorError
  | BackendTransactionRetryError
  | BackendUnknownSandboxTypeError;

export let zToBackendArchiveSessionError = z.discriminatedUnion('code', [
  zBackendEditorSessionLockFailedError,
  zBackendHashSecretIsNotDefinedError,
  zBackendProjectDoesNotExistError,
  zBackendSessionNotFoundError,
  zBackendSessionTypeIsNotEditorError,
  zBackendTransactionRetryError,
  zBackendUnknownSandboxTypeError
]);

assertTypesEqual<
  ToBackendArchiveSessionError,
  z.infer<typeof zToBackendArchiveSessionError>
>({ value: true });
