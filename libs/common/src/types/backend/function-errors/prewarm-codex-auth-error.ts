import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type LoadCodexAuthError,
  zLoadCodexAuthError
} from '#common/types/backend/function-errors/load-codex-auth-error';
import {
  type PersistCodexAuthTokensError,
  zPersistCodexAuthTokensError
} from '#common/types/backend/function-errors/persist-codex-auth-tokens-error';
import {
  type RefreshCodexAuthAccessTokenError,
  zRefreshCodexAuthAccessTokenError
} from '#common/types/backend/function-errors/refresh-codex-auth-access-token-error';
import {
  type ValidateCodexAuthExpiresInError,
  zValidateCodexAuthExpiresInError
} from '#common/types/backend/function-errors/validate-codex-auth-expires-in-error';

export type PrewarmCodexAuthError =
  | LoadCodexAuthError
  | RefreshCodexAuthAccessTokenError
  | ValidateCodexAuthExpiresInError
  | PersistCodexAuthTokensError;

export let zPrewarmCodexAuthError = z.union([
  zLoadCodexAuthError,
  zRefreshCodexAuthAccessTokenError,
  zValidateCodexAuthExpiresInError,
  zPersistCodexAuthTokensError
]);

assertTypesEqual<PrewarmCodexAuthError, z.infer<typeof zPrewarmCodexAuthError>>(
  { value: true }
);
