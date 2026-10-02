import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendCodexDeviceAuthStartFailedError = {
  code: 'BACKEND_CODEX_DEVICE_AUTH_START_FAILED';
};

export let zBackendCodexDeviceAuthStartFailedError = z.object({
  code: z.literal('BACKEND_CODEX_DEVICE_AUTH_START_FAILED')
});

assertTypesEqual<
  BackendCodexDeviceAuthStartFailedError,
  z.infer<typeof zBackendCodexDeviceAuthStartFailedError>
>({ value: true });
