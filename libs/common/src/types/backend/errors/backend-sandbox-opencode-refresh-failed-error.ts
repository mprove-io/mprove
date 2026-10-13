import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendSandboxOpencodeRefreshFailedError = {
  code: 'BACKEND_SANDBOX_OPENCODE_REFRESH_FAILED';
  customData?: {
    originalError?: unknown;
  };
};

export let zBackendSandboxOpencodeRefreshFailedError = z.object({
  code: z.literal('BACKEND_SANDBOX_OPENCODE_REFRESH_FAILED'),
  customData: z
    .object({
      originalError: z.unknown().nullish()
    })
    .nullish()
});

assertTypesEqual<
  BackendSandboxOpencodeRefreshFailedError,
  z.infer<typeof zBackendSandboxOpencodeRefreshFailedError>
>({ value: true });
