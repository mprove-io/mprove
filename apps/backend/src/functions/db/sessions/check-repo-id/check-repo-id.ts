import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import { sessionsTable } from '#backend/drizzle/postgres/schema/sessions';
import type { DbService } from '#backend/services/db/db.service';
import { PROD_REPO_ID } from '#common/constants/top';
import type { CheckRepoIdError } from '#common/types/backend/function-errors/check-repo-id-error';
import type { RepoType } from '#common/types/disk/parts/repo/repo-type';

export async function checkRepoId(item: {
  repoId: string;
  userId: string;
  projectId: string;
  allowProdRepo: boolean;
  db: DbService;
}): Result.ResultAsync<RepoType, CheckRepoIdError> {
  let { repoId, userId, projectId, allowProdRepo, db } = item;

  if (repoId === PROD_REPO_ID) {
    if (allowProdRepo === false) {
      return Result.fail({ code: 'BACKEND_PRODUCTION_REPO_NOT_ALLOWED' });
    }

    return Result.succeed('production');
  }

  if (repoId === userId) {
    return Result.succeed('dev');
  }

  let isSessionExist: boolean = await db.sessions.isExistUnwrap({
    where: and(
      eq(sessionsTable.sessionId, repoId),
      eq(sessionsTable.repoId, repoId),
      eq(sessionsTable.userId, userId),
      eq(sessionsTable.projectId, projectId)
    )
  });

  if (isSessionExist) {
    return Result.succeed('session');
  }

  return Result.fail({ code: 'BACKEND_FORBIDDEN_REPO_ID' });
}
