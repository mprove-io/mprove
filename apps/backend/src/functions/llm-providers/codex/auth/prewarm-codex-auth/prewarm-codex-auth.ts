import { Result } from '@praha/byethrow';
import { extractCodexAuthAccountId } from '#backend/functions/llm-providers/codex/auth/extract-codex-auth-account-id/extract-codex-auth-account-id';
import { loadCodexAuth } from '#backend/functions/llm-providers/codex/auth/load-codex-auth/load-codex-auth';
import { persistCodexAuthTokens } from '#backend/functions/llm-providers/codex/auth/persist-codex-auth-tokens/persist-codex-auth-tokens';
import { refreshCodexAuthAccessToken } from '#backend/functions/llm-providers/codex/auth/prewarm-codex-auth/refresh-codex-auth-access-token/refresh-codex-auth-access-token';
import { validateCodexAuthExpiresIn } from '#backend/functions/llm-providers/codex/auth/validate-codex-auth-expires-in/validate-codex-auth-expires-in';
import type { DbService } from '#backend/services/db/db.service';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { PrewarmCodexAuthError } from '#common/types/backend/function-errors/prewarm-codex-auth-error';

// Refresh Codex auth before expiry, ahead of opencode's at-expiry refresh
// (external/opencode/packages/opencode/src/plugin/codex.ts line 410). Keeps
// the backend as the sole refresher, avoiding refresh_token rotation races.
export const CODEX_AUTH_REFRESH_BUFFER_SEC = 5 * 60 * 60;

const CODEX_AUTH_REFRESH_BUFFER_MS = CODEX_AUTH_REFRESH_BUFFER_SEC * 1000;

export async function prewarmCodexAuth(item: {
  userId: string;
  db: DbService;
}): Result.ResultAsync<void, PrewarmCodexAuthError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('auth', v =>
      loadCodexAuth({
        userId: v.userId,
        db: v.db
      })
    ),
    Result.bind('tokens', async v =>
      v.auth.access &&
      v.auth.expires > Date.now() + CODEX_AUTH_REFRESH_BUFFER_MS
        ? Result.succeed(undefined)
        : refreshCodexAuthAccessToken({
            refreshToken: v.auth.refresh
          })
    ),
    Result.bind('expiresIn', v =>
      isUndefined(v.tokens)
        ? Result.succeed(undefined)
        : validateCodexAuthExpiresIn({
            expiresIn: v.tokens.expires_in
          })
    ),
    Result.bind('accountId', v =>
      Result.succeed(
        isUndefined(v.tokens)
          ? undefined
          : extractCodexAuthAccountId({
              tokens: v.tokens
            }) || v.auth.accountId
      )
    ),
    Result.andThrough(v =>
      isUndefined(v.tokens)
        ? Result.succeed()
        : persistCodexAuthTokens({
            userId: v.userId,
            newState: {
              access: v.tokens.access_token,
              refresh: v.tokens.refresh_token,
              expires: Date.now() + v.expiresIn * 1000,
              accountId: v.accountId
            },
            db: v.db
          })
    ),
    Result.map((v): void => undefined)
  );
}
