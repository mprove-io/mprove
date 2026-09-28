import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendEditorSessionLockFailedError,
  zBackendEditorSessionLockFailedError
} from '#common/zod/backend/errors/backend-editor-session-lock-failed-error';
import {
  type BackendHashSecretIsNotDefinedError,
  zBackendHashSecretIsNotDefinedError
} from '#common/zod/backend/errors/backend-hash-secret-is-not-defined-error';
import {
  type BackendProjectDoesNotExistError,
  zBackendProjectDoesNotExistError
} from '#common/zod/backend/errors/backend-project-does-not-exist-error';
import {
  type BackendSessionNotFoundError,
  zBackendSessionNotFoundError
} from '#common/zod/backend/errors/backend-session-not-found-error';
import {
  type BackendSessionTypeIsNotEditorError,
  zBackendSessionTypeIsNotEditorError
} from '#common/zod/backend/errors/backend-session-type-is-not-editor-error';
import {
  type BackendUnknownSandboxTypeError,
  zBackendUnknownSandboxTypeError
} from '#common/zod/backend/errors/backend-unknown-sandbox-type-error';

export type ToBackendPauseEditorSessionError =
  | BackendEditorSessionLockFailedError
  | BackendHashSecretIsNotDefinedError
  | BackendProjectDoesNotExistError
  | BackendSessionNotFoundError
  | BackendSessionTypeIsNotEditorError
  | BackendUnknownSandboxTypeError;

export let zToBackendPauseEditorSessionError = z.discriminatedUnion('code', [
  zBackendEditorSessionLockFailedError,
  zBackendHashSecretIsNotDefinedError,
  zBackendProjectDoesNotExistError,
  zBackendSessionNotFoundError,
  zBackendSessionTypeIsNotEditorError,
  zBackendUnknownSandboxTypeError
]);

assertTypesEqual<
  ToBackendPauseEditorSessionError,
  z.infer<typeof zToBackendPauseEditorSessionError>
>({ value: true });
