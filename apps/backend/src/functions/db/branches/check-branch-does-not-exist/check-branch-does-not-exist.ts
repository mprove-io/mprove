import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import { branchesTable } from '#backend/drizzle/postgres/tables/branches';
import type { DbService } from '#backend/services/db/db.service';
import type { CheckBranchDoesNotExistError } from '#common/types/backend/function-errors/check-branch-does-not-exist-error';

export async function checkBranchDoesNotExist(item: {
  projectId: string;
  repoId: string;
  branchId: string;
  db: DbService;
}): Result.ResultAsync<void, CheckBranchDoesNotExistError> {
  let { projectId, repoId, branchId, db } = item;

  let isBranchExist: boolean = await db.branches.isExistUnwrap({
    where: and(
      eq(branchesTable.projectId, projectId),
      eq(branchesTable.repoId, repoId),
      eq(branchesTable.branchId, branchId)
    )
  });

  if (isBranchExist) {
    return Result.fail({
      code: 'BACKEND_BRANCH_ALREADY_EXISTS'
    });
  }

  return Result.succeed();
}
