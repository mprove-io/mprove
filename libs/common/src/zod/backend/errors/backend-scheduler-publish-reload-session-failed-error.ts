import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendSchedulerPublishReloadSessionFailedError = {
  code: 'BACKEND_SCHEDULER_PUBLISH_RELOAD_SESSION_FAILED';
};

export let zBackendSchedulerPublishReloadSessionFailedError = z.object({
  code: z.literal('BACKEND_SCHEDULER_PUBLISH_RELOAD_SESSION_FAILED')
});

assertTypesEqual<
  BackendSchedulerPublishReloadSessionFailedError,
  z.infer<typeof zBackendSchedulerPublishReloadSessionFailedError>
>({ value: true });
