import * as nodegit from 'nodegit';
import { common } from '~disk/barrels/common';
import { constants } from '~disk/barrels/constants';

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
      : `${projectDir}/${constants.CENTRAL_REPO_ID}`;
  let dirDev = `${projectDir}/${devRepoId}`;

  await nodegit.Clone.clone(remoteUrl, dirDev, item.cloneOptions);
}
