import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendSandboxGitCloneFailedError = {
  code: 'BACKEND_SANDBOX_GIT_CLONE_FAILED';
};

export let zBackendSandboxGitCloneFailedError = z.object({
  code: z.literal('BACKEND_SANDBOX_GIT_CLONE_FAILED')
});

assertTypesEqual<
  BackendSandboxGitCloneFailedError,
  z.infer<typeof zBackendSandboxGitCloneFailedError>
>({ value: true });
