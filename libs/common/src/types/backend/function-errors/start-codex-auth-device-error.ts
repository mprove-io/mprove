import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendCodexDeviceAuthStartFailedError,
  zBackendCodexDeviceAuthStartFailedError
} from '#common/types/backend/errors/backend-codex-device-auth-start-failed-error';

export type StartCodexAuthDeviceError = BackendCodexDeviceAuthStartFailedError;

export const zStartCodexAuthDeviceError =
  zBackendCodexDeviceAuthStartFailedError;

assertTypesEqual<
  StartCodexAuthDeviceError,
  z.infer<typeof zStartCodexAuthDeviceError>
>({
  value: true
});
