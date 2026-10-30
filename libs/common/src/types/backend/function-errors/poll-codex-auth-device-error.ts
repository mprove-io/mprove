import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ExchangeCodexAuthDeviceCodeError,
  zExchangeCodexAuthDeviceCodeError
} from '#common/types/backend/function-errors/exchange-codex-auth-device-code-error';
import {
  type PersistCodexAuthTokensError,
  zPersistCodexAuthTokensError
} from '#common/types/backend/function-errors/persist-codex-auth-tokens-error';
import {
  type ValidateCodexAuthExpiresInError,
  zValidateCodexAuthExpiresInError
} from '#common/types/backend/function-errors/validate-codex-auth-expires-in-error';

export type PollCodexAuthDeviceError =
  | ExchangeCodexAuthDeviceCodeError
  | ValidateCodexAuthExpiresInError
  | PersistCodexAuthTokensError;

export const zPollCodexAuthDeviceError = z.union([
  zExchangeCodexAuthDeviceCodeError,
  zValidateCodexAuthExpiresInError,
  zPersistCodexAuthTokensError
]);

assertTypesEqual<
  PollCodexAuthDeviceError,
  z.infer<typeof zPollCodexAuthDeviceError>
>({
  value: true
});
