import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendEditorSessionLockFailedError = {
  code: 'BACKEND_EDITOR_SESSION_LOCK_FAILED';
};

export let zBackendEditorSessionLockFailedError = z.object({
  code: z.literal('BACKEND_EDITOR_SESSION_LOCK_FAILED')
});

assertTypesEqual<
  BackendEditorSessionLockFailedError,
  z.infer<typeof zBackendEditorSessionLockFailedError>
>({ value: true });
