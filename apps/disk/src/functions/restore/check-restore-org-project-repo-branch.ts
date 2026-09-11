import { Result } from '@praha/byethrow';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { isUndefined } from '#common/functions/is-undefined';
import type { DiskRepoIsNotCleanForCheckoutBranchError } from '#common/zod/disk/errors/disk-repo-is-not-clean-for-checkout-branch-error';
import type { ProjectLt } from '#common/zod/st-lt';
import { checkRestoreOrgProjectRepo } from './check-restore-org-project-repo';
import { restoreProjectGitCloneRepoBranch } from './restore-project-git-clone-repo-branch';

export function checkRestoreOrgProjectRepoBranch(item: {
  remoteType: ProjectRemoteTypeEnum;
  orgId: string;
  orgPath: string;
  projectId: string;
  projectLt: ProjectLt;
  repoId: string;
  branchId?: string;
}): Result.ResultAsync<string, DiskRepoIsNotCleanForCheckoutBranchError> {
  let { remoteType, orgId, orgPath, projectId, projectLt, repoId, branchId } =
    item;

  let projectDir = `${orgPath}/${orgId}/${projectId}`;

  let repoDir = `${projectDir}/${repoId}`;

  return Result.pipe(
    checkRestoreOrgProjectRepo({
      remoteType: remoteType,
      orgId: orgId,
      orgPath: orgPath,
      projectId: projectId,
      projectLt: projectLt,
      repoId: repoId
    }),
    Result.andThen(keyDir => {
      if (remoteType !== ProjectRemoteTypeEnum.GitClone) {
        return Result.succeed(keyDir);
      }

      if (isUndefined(branchId)) {
        return Result.succeed(keyDir);
      }

      return restoreProjectGitCloneRepoBranch({
        remoteType: remoteType,
        projectId: projectId,
        projectDir: projectDir,
        projectLt: projectLt,
        repoId: repoId,
        repoDir: repoDir,
        branchId: branchId,
        keyDir: keyDir
      });
    })
  );
}
