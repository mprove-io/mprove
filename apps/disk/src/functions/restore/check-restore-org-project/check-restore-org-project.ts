import { Result } from '@praha/byethrow';
import type { ProjectRemoteType } from '#common/types/backend/parts/project/project-remote-type';

import type { ProjectLt } from '#common/types/shared/st-lt/projects/project-lt';
import { checkRestoreOrg } from '#disk/functions/restore/check-restore-org/check-restore-org';
import { restoreProject } from '#disk/functions/restore/check-restore-org-project/restore-project/restore-project';

export async function checkRestoreOrgProject(item: {
  remoteType: ProjectRemoteType;
  orgId: string;
  orgPath: string;
  projectId: string;
  projectLt: ProjectLt;
}): Result.ResultAsync<string, never> {
  return Result.pipe(
    Result.succeed({
      ...item,
      orgDir: `${item.orgPath}/${item.orgId}`
    }),
    Result.andThrough(v =>
      checkRestoreOrg({ orgId: v.orgId, orgPath: v.orgPath })
    ),
    Result.andThen(
      (v): Result.ResultAsync<string, never> =>
        restoreProject({
          remoteType: v.remoteType,
          orgId: v.orgId,
          orgPath: v.orgPath,
          orgDir: v.orgDir,
          projectId: v.projectId,
          projectLt: v.projectLt
        })
    )
  );
}
