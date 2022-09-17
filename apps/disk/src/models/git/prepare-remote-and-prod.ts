import * as nodegit from 'nodegit';
import { common } from '~disk/barrels/common';
import { constants } from '~disk/barrels/constants';
import { disk } from '~disk/barrels/disk';
import { createInitialCommitToProd } from './create-initial-commit-to-prod';
import { pushToRemote } from './push-to-remote';

export async function prepareRemoteAndProd(item: {
  projectId: string;
  projectDir: string;
  testProjectId: string;
  userAlias: string;
  defaultBranch: string;
  remoteType: common.ProjectRemoteTypeEnum;
  gitUrl: string;
  cloneOptions: nodegit.CloneOptions;
}) {
  let prodDir = `${item.projectDir}/${common.PROD_REPO_ID}`;
  let centralDir = `${item.projectDir}/${constants.CENTRAL_REPO_ID}`;
  await disk.ensureDir(prodDir);

  if (item.remoteType === common.ProjectRemoteTypeEnum.Managed) {
    await disk.ensureDir(centralDir);

    // init central repo
    let isBare = 1;
    await nodegit.Repository.init(centralDir, isBare);
  }

  let remoteUrl =
    item.remoteType === common.ProjectRemoteTypeEnum.GitClone
      ? item.gitUrl
      : centralDir;

  await nodegit.Clone.clone(remoteUrl, prodDir, item.cloneOptions);

  if (item.remoteType === common.ProjectRemoteTypeEnum.Managed) {
    await createInitialCommitToProd({
      prodDir: prodDir,
      testProjectId: item.testProjectId,
      projectId: item.projectId,
      userAlias: item.userAlias
    });

    await pushToRemote({
      projectId: item.projectId,
      projectDir: item.projectDir,
      repoId: common.PROD_REPO_ID,
      repoDir: prodDir,
      branch: item.defaultBranch,
      fetchOptions: item.cloneOptions.fetchOpts
    });
  }
}
