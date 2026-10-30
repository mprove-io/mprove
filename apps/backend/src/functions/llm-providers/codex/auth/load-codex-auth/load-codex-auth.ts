import { Result } from '@praha/byethrow';
import { getUserCheckExists } from '#backend/functions/db/users/get-user-check-exists/get-user-check-exists';
import type { DbService } from '#backend/services/db/db.service';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { LoadCodexAuthError } from '#common/types/backend/function-errors/load-codex-auth-error';
import type { CodexAuthOpenai } from '#common/types/backend/parts/codex/codex-auth-openai';

export async function loadCodexAuth(item: {
  userId: string;
  db: DbService;
}): Result.ResultAsync<CodexAuthOpenai, LoadCodexAuthError> {
  return Result.pipe(
    Result.succeed(item),
    // Always read fresh user data from DB (multi-pod safe)
    Result.bind('user', v =>
      getUserCheckExists({
        userId: v.userId,
        db: v.db
      })
    ),
    Result.andThen(v =>
      isUndefined(v.user.codexAuth)
        ? Result.fail({ code: 'BACKEND_USER_PROFILE_CODEX_AUTH_NOT_SET' })
        : Result.succeed(v.user.codexAuth.openai)
    )
  );
}
