import { Result } from '@praha/byethrow';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { DiskCheckRestoreOrgProjectRepoBranchError } from '#common/zod/disk/function-errors/disk-check-restore-org-project-repo-branch-error';
import type { DiskRestoreProjectGitCloneRepoBranchError } from '#common/zod/disk/function-errors/disk-restore-project-git-clone-repo-branch-error';
import type { ProjectLt } from '#common/zod/st-lt';
import { checkRestoreOrgProjectRepo } from '#disk/functions/restore/check-restore-org-project-repo/check-restore-org-project-repo';
import { restoreProjectGitCloneRepoBranch } from '#disk/functions/restore/check-restore-org-project-repo-branch/restore-project-git-clone-repo-branch/restore-project-git-clone-repo-branch';

export function checkRestoreOrgProjectRepoBranch(item: {
  remoteType: ProjectRemoteTypeEnum;
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
    Result.bind(
      'keyDir',
      (v): Result.ResultAsync<string, never> =>
        checkRestoreOrgProjectRepo({
          remoteType: v.remoteType,
          orgId: v.orgId,
          orgPath: v.orgPath,
          projectId: v.projectId,
          projectLt: v.projectLt,
          repoId: v.repoId
        })
    ),
    Result.andThen(
      async (
        v
      ): Result.ResultAsync<
        string,
        DiskRestoreProjectGitCloneRepoBranchError
      > => {
        if (v.remoteType !== ProjectRemoteTypeEnum.GitClone) {
          return Result.succeed(v.keyDir);
        }

        if (isUndefined(v.branchId)) {
          return Result.succeed(v.keyDir);
        }

        return restoreProjectGitCloneRepoBranch({
          remoteType: v.remoteType,
          projectId: v.projectId,
          projectDir: v.projectDir,
          projectLt: v.projectLt,
          repoId: v.repoId,
          repoDir: v.repoDir,
          branchId: v.branchId,
          keyDir: v.keyDir
        });
      }
    )
  );
}
