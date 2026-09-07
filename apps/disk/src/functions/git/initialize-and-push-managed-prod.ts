import { Result } from '@praha/byethrow';
import type { SimpleGit } from 'simple-git';
import { BRANCH_MAIN, PROD_REPO_ID } from '#common/constants/top';
import { createSimpleGit } from '#node-common/functions/create-simple-git';
import type { DiskFileIsSymlinkError } from '../disk/errors/disk-file-is-symlink-error';
import { createInitialCommitToProd } from './create-initial-commit-to-prod';
import type { DiskRepoStatusIsNotNeedPushError } from './errors/disk-repo-status-is-not-need-push-error';
import { pushToRemote } from './push-to-remote';

export function initializeAndPushManagedProd(item: {
  projectId: string;
  projectDir: string;
  prodDir: string;
  testProjectId: string;
  projectName: string;
  userAlias: string;
}): Result.ResultAsync<
  void,
  DiskFileIsSymlinkError | DiskRepoStatusIsNotNeedPushError
> {
  return Result.pipe(
    Result.succeed({ ...item }),
    Result.andThrough(v =>
      createInitialCommitToProd({
        prodDir: v.prodDir,
        testProjectId: v.testProjectId,
        projectId: v.projectId,
        userAlias: v.userAlias,
        projectName: v.projectName
      })
    ),
    Result.andThen(v => {
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
