import { Result } from '@praha/byethrow';
import { getUserCheckExists } from '#backend/functions/db/users/get-user-check-exists/get-user-check-exists';
import type { DbService } from '#backend/services/db/db.service';
import type { PersistCodexAuthTokensError } from '#common/types/backend/function-errors/persist-codex-auth-tokens-error';

export type CodexTokenState = {
  access: string;
  refresh: string;
  expires: number;
  accountId?: string;
};

export async function persistCodexAuthTokens(item: {
  userId: string;
  newState: CodexTokenState;
  db: DbService;
}): Result.ResultAsync<void, PersistCodexAuthTokensError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('user', v =>
      getUserCheckExists({
        userId: v.userId,
        db: v.db
      })
    ),
    Result.map(v => {
      v.user.codexAuth = {
        openai: {
          type: 'oauth',
          refresh: v.newState.refresh,
          access: v.newState.access,
          expires: v.newState.expires,
          accountId: v.newState.accountId
        }
      };

      v.user.codexAuthUpdateTs = Date.now();

      v.user.codexAuthExpiresTs = v.newState.expires;

      return v;
    }),
    Result.andThrough(v => v.db.write({ insertOrUpdate: { users: [v.user] } })),
    Result.map((v): void => undefined)
  );
}
