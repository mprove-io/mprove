import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendTooManyActiveEditorSessionsError = {
  code: 'BACKEND_TOO_MANY_ACTIVE_EDITOR_SESSIONS';
};

export let zBackendTooManyActiveEditorSessionsError = z.object({
  code: z.literal('BACKEND_TOO_MANY_ACTIVE_EDITOR_SESSIONS')
});

assertTypesEqual<
  BackendTooManyActiveEditorSessionsError,
  z.infer<typeof zBackendTooManyActiveEditorSessionsError>
>({ value: true });
