import * as nodegit from '@figma/nodegit';
import { CENTRAL_REPO_ID } from '~common/constants/top-disk';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';

export async function cloneRemoteToDev(item: {
  orgId: string;
  projectId: string;
  devRepoId: string;
  orgPath: string;
  remoteType: ProjectRemoteTypeEnum;
  gitUrl: string;
  cloneOptions: nodegit.CloneOptions;
}) {
  let { orgId, projectId, devRepoId, orgPath, remoteType, gitUrl } = item;

  let projectDir = `${orgPath}/${orgId}/${projectId}`;

  let remoteUrl =
    remoteType === ProjectRemoteTypeEnum.GitClone
      ? gitUrl
      : `${projectDir}/${CENTRAL_REPO_ID}`;
  let dirDev = `${projectDir}/${devRepoId}`;

  await nodegit.Clone(remoteUrl, dirDev, item.cloneOptions);
}
