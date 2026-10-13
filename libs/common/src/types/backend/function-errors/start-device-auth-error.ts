import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendCodexDeviceAuthStartFailedError,
  zBackendCodexDeviceAuthStartFailedError
} from '#common/types/backend/errors/backend-codex-device-auth-start-failed-error';

export type StartDeviceAuthError = BackendCodexDeviceAuthStartFailedError;

export const zStartDeviceAuthError = zBackendCodexDeviceAuthStartFailedError;

assertTypesEqual<StartDeviceAuthError, z.infer<typeof zStartDeviceAuthError>>({
  value: true
});
