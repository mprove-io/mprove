import * as nodegit from 'nodegit';
import { common } from '~disk/barrels/common';
import { constants } from '~disk/barrels/constants';
import { disk } from '~disk/barrels/disk';
import { createInitialCommitToProd } from './create-initial-commit-to-prod';
import { pushToCentral } from './push-to-central';
import { constantFetchOptions } from './_constant-fetch-options';

export async function prepareCentralAndProd(item: {
  projectId: string;
  projectDir: string;
  testProjectId: string;
  userAlias: string;
}) {
  let centralDir = `${item.projectDir}/${constants.CENTRAL_REPO_ID}`;
  let prodDir = `${item.projectDir}/${common.PROD_REPO_ID}`;

  await disk.ensureDir(centralDir);
  await disk.ensureDir(prodDir);

  // init central repo
  let isBare = 1;
  await nodegit.Repository.init(centralDir, isBare);

  // clone central to prod
  let cloneOptions = { fetchOpts: constantFetchOptions };
  await nodegit.Clone.clone(centralDir, prodDir, cloneOptions);

  await createInitialCommitToProd({
    prodDir: prodDir,
    testProjectId: item.testProjectId,
    projectId: item.projectId,
    userAlias: item.userAlias
  });

  await pushToCentral({
    projectId: item.projectId,
    projectDir: item.projectDir,
    repoId: common.PROD_REPO_ID,
    repoDir: prodDir,
    branch: common.BRANCH_MASTER
  });
}
