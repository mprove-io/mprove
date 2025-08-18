import * as nodegit from '@figma/nodegit';
import { common } from '~disk/barrels/common';
import { CENTRAL_REPO_ID } from '~disk/constants/top';
import { ensureDir } from '../disk/ensure-dir';
import { createInitialCommitToProd } from './create-initial-commit-to-prod';
import { pushToRemote } from './push-to-remote';

export async function prepareRemoteAndProd(item: {
  projectId: string;
  projectDir: string;
  testProjectId: string;
  projectName: string;
  userAlias: string;
  remoteType: common.ProjectRemoteTypeEnum;
  gitUrl: string;
  cloneOptions: nodegit.CloneOptions;
}) {
  let prodDir = `${item.projectDir}/${common.PROD_REPO_ID}`;
  let centralDir = `${item.projectDir}/${CENTRAL_REPO_ID}`;
  await ensureDir(prodDir);

  if (item.remoteType === common.ProjectRemoteTypeEnum.Managed) {
    await ensureDir(centralDir);

    // init central repo
    let isBare = 1;
    let repo = await nodegit.Repository.init(centralDir, isBare);
    await repo.setHead(`refs/heads/${common.BRANCH_MAIN}`);
  }

  let remoteUrl =
    item.remoteType === common.ProjectRemoteTypeEnum.GitClone
      ? item.gitUrl
      : centralDir;

  await nodegit.Clone(remoteUrl, prodDir, item.cloneOptions);

  if (item.remoteType === common.ProjectRemoteTypeEnum.Managed) {
    await createInitialCommitToProd({
      prodDir: prodDir,
      testProjectId: item.testProjectId,
      projectId: item.projectId,
      userAlias: item.userAlias,
      projectName: item.projectName
    });

    await pushToRemote({
      projectId: item.projectId,
      projectDir: item.projectDir,
      repoId: common.PROD_REPO_ID,
      repoDir: prodDir,
      branch: common.BRANCH_MAIN,
      fetchOptions: item.cloneOptions.fetchOpts
    });
  }
}
