import { Result } from '@praha/byethrow';
import { PROD_REPO_ID } from '#common/constants/top';
import type { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import type { ProjectLt } from '#common/zod/st-lt';
import { isPathExist } from '#disk/functions/disk/is-path-exist';
import { cloneRemote } from '#disk/functions/git/clone-remote';

export function restoreProjectGitCloneRepo(item: {
  remoteType: ProjectRemoteTypeEnum.GitClone;
  orgId: string;
  orgPath: string;
  projectId: string;
  projectDir: string;
  projectLt: ProjectLt;
  repoId: string;
  keyDir: string;
}): Result.ResultAsync<string, never> {
  return Result.pipe(
    Result.succeed({ ...item }),
    Result.bind('repoDir', v => Result.succeed(`${v.projectDir}/${v.repoId}`)),
    Result.bind('isRepoExist', v =>
      v.repoId === PROD_REPO_ID
        ? Result.succeed(true)
        : isPathExist({ path: v.repoDir })
    ),
    Result.andThrough(v =>
      v.isRepoExist === false
        ? cloneRemote({
            orgId: v.orgId,
            projectId: v.projectId,
            repoId: v.repoId,
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
    Result.andThen(v => Result.succeed(v.keyDir))
  );
}
