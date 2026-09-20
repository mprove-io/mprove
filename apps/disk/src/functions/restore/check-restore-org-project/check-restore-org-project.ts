import { Result } from '@praha/byethrow';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import type { ProjectLt } from '#common/zod/st-lt';
import { checkRestoreOrg } from '#disk/functions/restore/check-restore-org/check-restore-org';
import { restoreProject } from '#disk/functions/restore/check-restore-org-project/restore-project/restore-project';

export function checkRestoreOrgProject(item: {
  remoteType: ProjectRemoteTypeEnum;
  orgId: string;
  orgPath: string;
  projectId: string;
  projectLt: ProjectLt;
}): Result.ResultAsync<string, never> {
  let { remoteType, orgId, orgPath, projectId, projectLt } = item;

  let orgDir = `${orgPath}/${orgId}`;

  return Result.pipe(
    checkRestoreOrg({ orgId: orgId, orgPath: orgPath }),
    Result.andThen(() =>
      restoreProject({
        remoteType: remoteType,
        orgId: orgId,
        orgPath: orgPath,
        orgDir: orgDir,
        projectId: projectId,
        projectLt: projectLt
      })
    )
  );
}
