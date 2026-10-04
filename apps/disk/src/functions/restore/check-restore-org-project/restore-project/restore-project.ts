import { Result } from '@praha/byethrow';
import type { ProjectRemoteType } from '#common/types/backend/parts/project/project-remote-type';

import type { ProjectLt } from '#common/types/shared/st-lt/projects/project-lt';
import { ensureDir } from '#disk/functions/disk/ensure-dir/ensure-dir';
import { restoreProjectGitClone } from '#disk/functions/restore/check-restore-org-project/restore-project/restore-project-git-clone/restore-project-git-clone';

export function restoreProject(item: {
  remoteType: ProjectRemoteType;
  orgId: string;
  orgPath: string;
  orgDir: string;
  projectId: string;
  projectLt: ProjectLt;
}): Result.ResultAsync<string, never> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind(
      'projectDir',
      (v): Result.Result<`${string}/${string}`, never> =>
        Result.succeed(`${v.orgDir}/${v.projectId}`)
    ),
    Result.bind(
      'keyDir',
      (v): Result.Result<`${string}/_keys/${string}`, never> =>
        Result.succeed(`${v.orgDir}/_keys/${v.projectId}`)
    ),
    Result.andThrough(v => ensureDir({ dir: v.keyDir })),
    Result.andThen(async (v): Result.ResultAsync<string, never> => {
      if (v.remoteType !== 'GitClone') {
        return Result.succeed(v.keyDir);
      }

      return restoreProjectGitClone({
        remoteType: v.remoteType,
        orgId: v.orgId,
        orgPath: v.orgPath,
        projectId: v.projectId,
        projectDir: v.projectDir,
        projectLt: v.projectLt,
        keyDir: v.keyDir
      });
    })
  );
}
