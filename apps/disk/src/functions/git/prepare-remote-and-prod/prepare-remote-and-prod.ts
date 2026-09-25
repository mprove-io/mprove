import { Result } from '@praha/byethrow';
import type { SimpleGit } from 'simple-git';
import { PROD_REPO_ID } from '#common/constants/top';
import { CENTRAL_REPO_ID } from '#common/constants/top-disk';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import type { DiskInitializeAndPushManagedProdError } from '#common/zod/disk/function-errors/disk-initialize-and-push-managed-prod-error';
import type { DiskPrepareRemoteAndProdError } from '#common/zod/disk/function-errors/disk-prepare-remote-and-prod-error';
import { ensureDir } from '#disk/functions/disk/ensure-dir/ensure-dir';
import { createGit } from '#disk/functions/git/create-git/create-git';
import { initializeAndPushManagedProd } from '#disk/functions/git/prepare-remote-and-prod/initialize-and-push-managed-prod/initialize-and-push-managed-prod';
import { initializeManagedCentralRepo } from '#disk/functions/git/prepare-remote-and-prod/initialize-managed-central-repo/initialize-managed-central-repo';
import { addTraceSpan } from '#node-common/functions/add-trace-span/add-trace-span';

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
}): Result.ResultAsync<void, DiskPrepareRemoteAndProdError> {
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
        Result.bind(
          'git',
          (v): Result.ResultAsync<SimpleGit, never> =>
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
        Result.andThen(
          async (
            v
          ): Result.ResultAsync<void, DiskInitializeAndPushManagedProdError> =>
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
