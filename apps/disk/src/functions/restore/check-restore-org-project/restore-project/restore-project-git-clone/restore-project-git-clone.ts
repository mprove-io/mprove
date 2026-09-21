import { Result } from '@praha/byethrow';
import { PROD_REPO_ID } from '#common/constants/top';
import type { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import type { ProjectLt } from '#common/zod/st-lt';
import { ensureDir } from '#disk/functions/disk/ensure-dir/ensure-dir';
import { isPathExist } from '#disk/functions/disk/is-path-exist/is-path-exist';
import { cloneRemote } from '#disk/functions/git/clone-remote/clone-remote';

export function restoreProjectGitClone(item: {
  remoteType: ProjectRemoteTypeEnum.GitClone;
  orgId: string;
  orgPath: string;
  projectId: string;
  projectDir: string;
  projectLt: ProjectLt;
  keyDir: string;
}): Result.ResultAsync<string, never> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind(
      'prodRepoDir',
      (v): Result.Result<`${string}/production`, never> =>
        Result.succeed(`${v.projectDir}/${PROD_REPO_ID}`)
    ),
    Result.bind(
      'isProjectExist',
      (v): Result.ResultAsync<boolean, never> =>
        isPathExist({ path: v.projectDir })
    ),
    Result.andThrough(v =>
      v.isProjectExist === false
        ? ensureDir({ dir: v.projectDir })
        : Result.succeed()
    ),
    Result.bind(
      'isProdRepoExist',
      (v): Result.ResultAsync<boolean, never> =>
        isPathExist({ path: v.prodRepoDir })
    ),
    Result.andThrough(v =>
      v.isProdRepoExist === false
        ? cloneRemote({
            orgId: v.orgId,
            projectId: v.projectId,
            repoId: PROD_REPO_ID,
            orgPath: v.orgPath,
            remoteType: v.remoteType,
            gitUrl: v.projectLt.gitUrl,
            keyDir: v.keyDir,
            privateKeyEncrypted: v.projectLt.privateKeyEncrypted,
            publicKey: v.projectLt.publicKey,
            passPhrase: v.projectLt.passPhrase
          })
        : Result.succeed()
    ),
    Result.andThen(
      (v): Result.Result<string, never> => Result.succeed(v.keyDir)
    )
  );
}
