import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendSandboxHealthCheckFailedError = {
  code: 'BACKEND_SANDBOX_HEALTH_CHECK_FAILED';
};

export let zBackendSandboxHealthCheckFailedError = z.object({
  code: z.literal('BACKEND_SANDBOX_HEALTH_CHECK_FAILED')
});

assertTypesEqual<
  BackendSandboxHealthCheckFailedError,
  z.infer<typeof zBackendSandboxHealthCheckFailedError>
>({ value: true });
