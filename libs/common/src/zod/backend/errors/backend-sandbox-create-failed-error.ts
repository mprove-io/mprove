import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendSandboxCreateFailedError = {
  code: 'BACKEND_SANDBOX_CREATE_FAILED';
};

export let zBackendSandboxCreateFailedError = z.object({
  code: z.literal('BACKEND_SANDBOX_CREATE_FAILED')
});

assertTypesEqual<
  BackendSandboxCreateFailedError,
  z.infer<typeof zBackendSandboxCreateFailedError>
>({ value: true });
