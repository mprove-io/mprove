import { Result } from '@praha/byethrow';
import { PROD_REPO_ID } from '#common/constants/top';
import { CENTRAL_REPO_ID } from '#common/constants/top-disk';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import type { DiskRepoStatusIsNotNeedPushError } from '#common/zod/disk/errors/disk-repo-status-is-not-need-push-error';
import type { FileIsSymlinkError } from '#common/zod/disk/errors/file-is-symlink-error';
import { createGit } from '#disk/functions/git/create-git';
import { addTraceSpan } from '#node-common/functions/add-trace-span';
import { ensureDir } from '../disk/ensure-dir';
import { initializeAndPushManagedProd } from './initialize-and-push-managed-prod';
import { initializeManagedCentralRepo } from './initialize-managed-central-repo';

export function prepareRemoteAndProd(item: {
  projectId: string;
  projectDir: string;
  seedProjectId: string;
  projectName: string;
  userAlias: string;
  remoteType: ProjectRemoteTypeEnum;
  gitUrl: string;
  keyDir: string;
  privateKeyEncrypted: string;
  publicKey: string;
  passPhrase: string;
}): Result.ResultAsync<
  void,
  FileIsSymlinkError | DiskRepoStatusIsNotNeedPushError
> {
  return addTraceSpan({
    spanName: 'disk.git.prepareRemoteAndProd',
    fn: () =>
      Result.pipe(
        Result.succeed({
          ...item,
          prodDir: `${item.projectDir}/${PROD_REPO_ID}`,
          centralDir: `${item.projectDir}/${CENTRAL_REPO_ID}`,
          remoteUrl:
            item.remoteType === ProjectRemoteTypeEnum.GitClone
              ? item.gitUrl
              : `${item.projectDir}/${CENTRAL_REPO_ID}`
        }),
        Result.andThrough(v => ensureDir({ dir: v.prodDir })),
        Result.andThrough(v =>
          v.remoteType === ProjectRemoteTypeEnum.Managed
            ? initializeManagedCentralRepo({ centralDir: v.centralDir })
            : Result.succeed()
        ),
        Result.bind('git', v =>
          createGit({
            repoDir: undefined,
            remoteType: v.remoteType,
            keyDir: v.keyDir,
            gitUrl: v.gitUrl,
            privateKeyEncrypted: v.privateKeyEncrypted,
            publicKey: v.publicKey,
            passPhrase: v.passPhrase
          })
        ),
        Result.andThrough(async v => {
          await v.git.clone(v.remoteUrl, v.prodDir);

          return Result.succeed();
        }),
        Result.andThen(v =>
          v.remoteType === ProjectRemoteTypeEnum.Managed
            ? initializeAndPushManagedProd({
                projectId: v.projectId,
                projectDir: v.projectDir,
                prodDir: v.prodDir,
                seedProjectId: v.seedProjectId,
                userAlias: v.userAlias,
                projectName: v.projectName
              })
            : Result.succeed()
        )
      )
  });
}
