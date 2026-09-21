import { Result } from '@praha/byethrow';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import type { ProjectLt } from '#common/zod/st-lt';
import { checkRestoreOrgProject } from '#disk/functions/restore/check-restore-org-project/check-restore-org-project';
import { restoreProjectGitCloneRepo } from '#disk/functions/restore/check-restore-org-project-repo/restore-project-git-clone-repo/restore-project-git-clone-repo';

export function checkRestoreOrgProjectRepo(item: {
  remoteType: ProjectRemoteTypeEnum;
  orgId: string;
  orgPath: string;
  projectId: string;
  projectLt: ProjectLt;
  repoId: string;
}): Result.ResultAsync<string, never> {
  return Result.pipe(
    Result.succeed({
      ...item,
      projectDir: `${item.orgPath}/${item.orgId}/${item.projectId}`
    }),
    Result.bind(
      'keyDir',
      (v): Result.ResultAsync<string, never> =>
        checkRestoreOrgProject({
          remoteType: v.remoteType,
          orgId: v.orgId,
          orgPath: v.orgPath,
          projectId: v.projectId,
          projectLt: v.projectLt
        })
    ),
    Result.andThen(async (v): Result.ResultAsync<string, never> => {
      if (v.remoteType !== ProjectRemoteTypeEnum.GitClone) {
        return Result.succeed(v.keyDir);
      }

      return restoreProjectGitCloneRepo({
        remoteType: v.remoteType,
        orgId: v.orgId,
        orgPath: v.orgPath,
        projectId: v.projectId,
        projectDir: v.projectDir,
        projectLt: v.projectLt,
        repoId: v.repoId,
        keyDir: v.keyDir
      });
    })
  );
}
