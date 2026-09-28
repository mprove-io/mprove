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
  type BackendMemberDoesNotExistError,
  zBackendMemberDoesNotExistError
} from '#common/zod/backend/errors/backend-member-does-not-exist-error';
import {
  type BackendProjectDoesNotExistError,
  zBackendProjectDoesNotExistError
} from '#common/zod/backend/errors/backend-project-does-not-exist-error';
import {
  type BackendSchedulerSyncEditorSessionStatusFailedError,
  zBackendSchedulerSyncEditorSessionStatusFailedError
} from '#common/zod/backend/errors/backend-scheduler-sync-editor-session-status-failed-error';
import {
  type BackendSessionNotFoundError,
  zBackendSessionNotFoundError
} from '#common/zod/backend/errors/backend-session-not-found-error';

export type ToBackendGetSessionsListError =
  | BackendEditorSessionLockFailedError
  | BackendHashSecretIsNotDefinedError
  | BackendMemberDoesNotExistError
  | BackendProjectDoesNotExistError
  | BackendSchedulerSyncEditorSessionStatusFailedError
  | BackendSessionNotFoundError;

export let zToBackendGetSessionsListError = z.discriminatedUnion('code', [
  zBackendEditorSessionLockFailedError,
  zBackendHashSecretIsNotDefinedError,
  zBackendMemberDoesNotExistError,
  zBackendProjectDoesNotExistError,
  zBackendSchedulerSyncEditorSessionStatusFailedError,
  zBackendSessionNotFoundError
]);

assertTypesEqual<
  ToBackendGetSessionsListError,
  z.infer<typeof zToBackendGetSessionsListError>
>({ value: true });
