import * as nodegit from '@figma/nodegit';
import { common } from '~disk/barrels/common';
import { CENTRAL_REPO_ID } from '~disk/constants/top';

export async function cloneRemoteToDev(item: {
  orgId: string;
  projectId: string;
  devRepoId: string;
  orgPath: string;
  remoteType: common.ProjectRemoteTypeEnum;
  gitUrl: string;
  cloneOptions: nodegit.CloneOptions;
}) {
  let { orgId, projectId, devRepoId, orgPath, remoteType, gitUrl } = item;

  let projectDir = `${orgPath}/${orgId}/${projectId}`;

  let remoteUrl =
    remoteType === common.ProjectRemoteTypeEnum.GitClone
      ? gitUrl
      : `${projectDir}/${CENTRAL_REPO_ID}`;
  let dirDev = `${projectDir}/${devRepoId}`;

  await nodegit.Clone(remoteUrl, dirDev, item.cloneOptions);
}
