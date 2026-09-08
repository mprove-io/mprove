import { Result } from '@praha/byethrow';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import type { ProjectLt } from '#common/zod/st-lt';
import { ensureDir } from '#disk/functions/disk/ensure-dir';
import { restoreProjectGitClone } from './restore-project-git-clone';

export function restoreProject(item: {
  remoteType: ProjectRemoteTypeEnum;
  orgId: string;
  orgPath: string;
  orgDir: string;
  projectId: string;
  projectLt: ProjectLt;
}): Result.ResultAsync<string, never> {
  return Result.pipe(
    Result.succeed({ ...item }),
    Result.bind('projectDir', v =>
      Result.succeed(`${v.orgDir}/${v.projectId}`)
    ),
    Result.bind('keyDir', v =>
      Result.succeed(`${v.orgDir}/_keys/${v.projectId}`)
    ),
    Result.andThrough(v => ensureDir({ dir: v.keyDir })),
    Result.andThen(v => {
      if (v.remoteType !== ProjectRemoteTypeEnum.GitClone) {
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
