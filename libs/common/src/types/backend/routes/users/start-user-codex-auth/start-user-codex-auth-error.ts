import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendCodexDeviceAuthStartFailedError,
  zBackendCodexDeviceAuthStartFailedError
} from '#common/types/backend/errors/backend-codex-device-auth-start-failed-error';
import {
  type BackendRestrictedUserError,
  zBackendRestrictedUserError
} from '#common/types/backend/errors/backend-restricted-user-error';

export type ToBackendStartUserCodexAuthError =
  | BackendCodexDeviceAuthStartFailedError
  | BackendRestrictedUserError;

export let zToBackendStartUserCodexAuthError = z.discriminatedUnion('code', [
  zBackendCodexDeviceAuthStartFailedError,
  zBackendRestrictedUserError
]);

assertTypesEqual<
  ToBackendStartUserCodexAuthError,
  z.infer<typeof zToBackendStartUserCodexAuthError>
>({ value: true });
