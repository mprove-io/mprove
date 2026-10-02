import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendSandboxGitCheckoutFailedError = {
  code: 'BACKEND_SANDBOX_GIT_CHECKOUT_FAILED';
};

export let zBackendSandboxGitCheckoutFailedError = z.object({
  code: z.literal('BACKEND_SANDBOX_GIT_CHECKOUT_FAILED')
});

assertTypesEqual<
  BackendSandboxGitCheckoutFailedError,
  z.infer<typeof zBackendSandboxGitCheckoutFailedError>
>({ value: true });
