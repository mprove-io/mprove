import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendSchedulerSyncEditorSessionStatusFailedError = {
  code: 'BACKEND_SCHEDULER_SYNC_EDITOR_SESSION_STATUS_FAILED';
};

export let zBackendSchedulerSyncEditorSessionStatusFailedError = z.object({
  code: z.literal('BACKEND_SCHEDULER_SYNC_EDITOR_SESSION_STATUS_FAILED')
});

assertTypesEqual<
  BackendSchedulerSyncEditorSessionStatusFailedError,
  z.infer<typeof zBackendSchedulerSyncEditorSessionStatusFailedError>
>({ value: true });
