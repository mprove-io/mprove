import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendEditorSessionLockFailedError,
  zBackendEditorSessionLockFailedError
} from '#common/types/backend/errors/backend-editor-session-lock-failed-error';

export type AcquireSessionLockResultError = BackendEditorSessionLockFailedError;

export let zAcquireSessionLockResultError =
  zBackendEditorSessionLockFailedError;

assertTypesEqual<
  AcquireSessionLockResultError,
  z.infer<typeof zAcquireSessionLockResultError>
>({ value: true });
