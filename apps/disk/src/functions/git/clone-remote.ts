import { CENTRAL_REPO_ID } from '#common/constants/top-disk';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { createGitInstance } from '#disk/functions/make-fetch-options';
import { addTraceSpan } from '#node-common/functions/add-trace-span';

export async function cloneRemote(item: {
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
}) {
  return await addTraceSpan({
    spanName: 'disk.git.cloneRemote',
    fn: async () => {
      let {
        orgId,
        projectId,
        repoId,
        orgPath,
        remoteType,
        gitUrl,
        keyDir,
        privateKeyEncrypted,
        publicKey,
        passPhrase
      } = item;

      let projectDir = `${orgPath}/${orgId}/${projectId}`;

      let remoteUrl =
        remoteType === ProjectRemoteTypeEnum.GitClone
          ? gitUrl
          : `${projectDir}/${CENTRAL_REPO_ID}`;

      let dirDev = `${projectDir}/${repoId}`;

      let git = await createGitInstance({
        repoDir: undefined,
        remoteType: remoteType,
        keyDir: keyDir,
        gitUrl: gitUrl,
        privateKeyEncrypted: privateKeyEncrypted,
        publicKey: publicKey,
        passPhrase: passPhrase
      });

      await git.clone(remoteUrl, dirDev);
    }
  });
}
