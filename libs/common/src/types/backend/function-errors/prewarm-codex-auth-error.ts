import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type LoadAuthError,
  zLoadAuthError
} from '#common/types/backend/function-errors/load-auth-error';
import {
  type PersistRefreshedTokensError,
  zPersistRefreshedTokensError
} from '#common/types/backend/function-errors/persist-refreshed-tokens-error';
import {
  type RefreshAccessTokenError,
  zRefreshAccessTokenError
} from '#common/types/backend/function-errors/refresh-access-token-error';
import {
  type ValidateExpiresInError,
  zValidateExpiresInError
} from '#common/types/backend/function-errors/validate-expires-in-error';

export type PrewarmCodexAuthError =
  | LoadAuthError
  | RefreshAccessTokenError
  | ValidateExpiresInError
  | PersistRefreshedTokensError;

export let zPrewarmCodexAuthError = z.union([
  zLoadAuthError,
  zRefreshAccessTokenError,
  zValidateExpiresInError,
  zPersistRefreshedTokensError
]);

assertTypesEqual<PrewarmCodexAuthError, z.infer<typeof zPrewarmCodexAuthError>>(
  { value: true }
);
