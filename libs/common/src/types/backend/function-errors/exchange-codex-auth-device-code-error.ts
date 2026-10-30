import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendCodexDeviceAuthStartFailedError,
  zBackendCodexDeviceAuthStartFailedError
} from '#common/types/backend/errors/backend-codex-device-auth-start-failed-error';

export type ExchangeCodexAuthDeviceCodeError =
  BackendCodexDeviceAuthStartFailedError;

export const zExchangeCodexAuthDeviceCodeError =
  zBackendCodexDeviceAuthStartFailedError;

assertTypesEqual<
  ExchangeCodexAuthDeviceCodeError,
  z.infer<typeof zExchangeCodexAuthDeviceCodeError>
>({ value: true });
