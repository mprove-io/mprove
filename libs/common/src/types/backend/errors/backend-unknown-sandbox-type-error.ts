import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendUnknownSandboxTypeError = {
  code: 'BACKEND_UNKNOWN_SANDBOX_TYPE';
};

export let zBackendUnknownSandboxTypeError = z.object({
  code: z.literal('BACKEND_UNKNOWN_SANDBOX_TYPE')
});

assertTypesEqual<
  BackendUnknownSandboxTypeError,
  z.infer<typeof zBackendUnknownSandboxTypeError>
>({ value: true });
