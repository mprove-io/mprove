import { constants } from '~/barrels/constants';
import { disk } from '~/barrels/disk';
import { api } from '~/barrels/api';
import { createInitialCommitToProd } from './create-initial-commit-to-prod';
import { pushToCentral } from './push-to-central';
import * as nodegit from 'nodegit';
import { constantFetchOptions } from './_constant-fetch-options';

export async function prepareCentralAndProd(item: {
  projectId: string;
  projectDir: string;
  useData: boolean;
  userAlias: string;
}) {
  let centralDir = `${item.projectDir}/${constants.CENTRAL_REPO_ID}`;
  let prodDir = `${item.projectDir}/${api.PROD_REPO_ID}`;

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
    useData: item.useData,
    projectId: item.projectId,
    userAlias: item.userAlias
  });

  await pushToCentral({
    projectId: item.projectId,
    projectDir: item.projectDir,
    repoId: api.PROD_REPO_ID,
    repoDir: prodDir,
    branch: api.BRANCH_MASTER
  });
}
