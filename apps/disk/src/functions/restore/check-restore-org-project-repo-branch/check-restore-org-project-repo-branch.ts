import { Result } from '@praha/byethrow';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { ProjectRemoteType } from '#common/types/backend/parts/project/project-remote-type';
import type { DiskCheckRestoreOrgProjectRepoBranchError } from '#common/types/disk/function-errors/disk-check-restore-org-project-repo-branch-error';
import type { ProjectLt } from '#common/types/shared/st-lt/projects/project-lt';
import { checkRestoreOrgProjectRepo } from '#disk/functions/restore/check-restore-org-project-repo/check-restore-org-project-repo';
import { restoreProjectGitCloneRepoBranch } from '#disk/functions/restore/check-restore-org-project-repo-branch/restore-project-git-clone-repo-branch/restore-project-git-clone-repo-branch';

export async function checkRestoreOrgProjectRepoBranch(item: {
  remoteType: ProjectRemoteType;
  orgId: string;
  orgPath: string;
  projectId: string;
  projectLt: ProjectLt;
  repoId: string;
  branchId?: string;
}): Result.ResultAsync<string, DiskCheckRestoreOrgProjectRepoBranchError> {
  return Result.pipe(
    Result.succeed({
      ...item,
      projectDir: `${item.orgPath}/${item.orgId}/${item.projectId}`,
      repoDir: `${item.orgPath}/${item.orgId}/${item.projectId}/${item.repoId}`
    }),
    Result.bind('keyDir', v =>
      checkRestoreOrgProjectRepo({
        remoteType: v.remoteType,
        orgId: v.orgId,
        orgPath: v.orgPath,
        projectId: v.projectId,
        projectLt: v.projectLt,
        repoId: v.repoId
      })
    ),
    Result.andThen(async v =>
      v.remoteType !== 'GitClone' || isUndefined(v.branchId)
        ? Result.succeed(v.keyDir)
        : restoreProjectGitCloneRepoBranch({
            remoteType: v.remoteType,
            projectId: v.projectId,
            projectDir: v.projectDir,
            projectLt: v.projectLt,
            repoId: v.repoId,
            repoDir: v.repoDir,
            branchId: v.branchId,
            keyDir: v.keyDir
          })
    )
  );
}
