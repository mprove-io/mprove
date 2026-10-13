import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ExchangeDeviceAuthCodeError,
  zExchangeDeviceAuthCodeError
} from '#common/types/backend/function-errors/exchange-device-auth-code-error';
import {
  type PersistRefreshedTokensError,
  zPersistRefreshedTokensError
} from '#common/types/backend/function-errors/persist-refreshed-tokens-error';
import {
  type ValidateExpiresInError,
  zValidateExpiresInError
} from '#common/types/backend/function-errors/validate-expires-in-error';

export type PollDeviceAuthError =
  | ExchangeDeviceAuthCodeError
  | ValidateExpiresInError
  | PersistRefreshedTokensError;

export const zPollDeviceAuthError = z.union([
  zExchangeDeviceAuthCodeError,
  zValidateExpiresInError,
  zPersistRefreshedTokensError
]);

assertTypesEqual<PollDeviceAuthError, z.infer<typeof zPollDeviceAuthError>>({
  value: true
});
