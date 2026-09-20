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
  let { remoteType, orgId, orgPath, projectId, projectLt, repoId } = item;

  let projectDir = `${orgPath}/${orgId}/${projectId}`;

  return Result.pipe(
    checkRestoreOrgProject({
      remoteType: remoteType,
      orgId: orgId,
      orgPath: orgPath,
      projectId: projectId,
      projectLt: projectLt
    }),
    Result.andThen(keyDir => {
      if (remoteType !== ProjectRemoteTypeEnum.GitClone) {
        return Result.succeed(keyDir);
      }

      return restoreProjectGitCloneRepo({
        remoteType: remoteType,
        orgId: orgId,
        orgPath: orgPath,
        projectId: projectId,
        projectDir: projectDir,
        projectLt: projectLt,
        repoId: repoId,
        keyDir: keyDir
      });
    })
  );
}
