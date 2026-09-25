import { Result } from '@praha/byethrow';
import type { SimpleGit } from 'simple-git';
import { BRANCH_MAIN, PROD_REPO_ID } from '#common/constants/top';
import type { DiskInitializeAndPushManagedProdError } from '#common/zod/disk/function-errors/disk-initialize-and-push-managed-prod-error';
import type { DiskPushToRemoteError } from '#common/zod/disk/function-errors/disk-push-to-remote-error';
import { createInitialCommitToProd } from '#disk/functions/git/prepare-remote-and-prod/initialize-and-push-managed-prod/create-initial-commit-to-prod/create-initial-commit-to-prod';
import { pushToRemote } from '#disk/functions/git/push-to-remote/push-to-remote';
import { createSimpleGit } from '#node-common/functions/create-simple-git/create-simple-git';

export function initializeAndPushManagedProd(item: {
  projectId: string;
  projectDir: string;
  prodDir: string;
  seedProjectId: string;
  projectName: string;
  userAlias: string;
}): Result.ResultAsync<void, DiskInitializeAndPushManagedProdError> {
  return Result.pipe(
    Result.succeed(item),
    Result.andThrough(v =>
      createInitialCommitToProd({
        prodDir: v.prodDir,
        seedProjectId: v.seedProjectId,
        projectId: v.projectId,
        userAlias: v.userAlias,
        projectName: v.projectName
      })
    ),
    Result.andThen((v): Result.ResultAsync<void, DiskPushToRemoteError> => {
      let prodGit: SimpleGit = createSimpleGit({ baseDir: v.prodDir });

      return pushToRemote({
        projectId: v.projectId,
        projectDir: v.projectDir,
        repoId: PROD_REPO_ID,
        repoDir: v.prodDir,
        branch: BRANCH_MAIN,
        git: prodGit,
        isFetch: true
      });
    })
  );
}
