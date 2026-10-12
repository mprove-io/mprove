import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendEditorSessionLockFailedError,
  zBackendEditorSessionLockFailedError
} from '#common/types/backend/errors/backend-editor-session-lock-failed-error';

export type AcquireSessionLockError = BackendEditorSessionLockFailedError;

export let zAcquireSessionLockError = zBackendEditorSessionLockFailedError;

assertTypesEqual<
  AcquireSessionLockError,
  z.infer<typeof zAcquireSessionLockError>
>({ value: true });
