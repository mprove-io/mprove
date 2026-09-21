import { Result } from '@praha/byethrow';
import type { SimpleGit } from 'simple-git';
import { CENTRAL_REPO_ID } from '#common/constants/top-disk';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { createGit } from '#disk/functions/git/create-git/create-git';
import { addTraceSpan } from '#node-common/functions/add-trace-span';

export function cloneRemote(item: {
  orgId: string;
  projectId: string;
  repoId: string;
  orgPath: string;
  remoteType: ProjectRemoteTypeEnum;
  gitUrl: string;
  keyDir: string;
  privateKeyEncrypted: string;
  publicKey: string;
  passPhrase: string;
}): Result.ResultAsync<void, never> {
  return addTraceSpan({
    spanName: 'disk.git.cloneRemote',
    fn: () =>
      Result.pipe(
        Result.succeed({
          remoteType: item.remoteType,
          keyDir: item.keyDir,
          gitUrl: item.gitUrl,
          privateKeyEncrypted: item.privateKeyEncrypted,
          publicKey: item.publicKey,
          passPhrase: item.passPhrase,
          remoteUrl:
            item.remoteType === ProjectRemoteTypeEnum.GitClone
              ? item.gitUrl
              : `${item.orgPath}/${item.orgId}/${item.projectId}/${CENTRAL_REPO_ID}`,
          dirDev: `${item.orgPath}/${item.orgId}/${item.projectId}/${item.repoId}`
        }),
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
        Result.andThen(async (v): Result.ResultAsync<void, never> => {
          await v.git.clone(v.remoteUrl, v.dirDev);

          return Result.succeed();
        })
      )
  });
}
