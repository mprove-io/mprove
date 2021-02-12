import * as nodegit from 'nodegit';
import { constants } from '~disk/barrels/constants';
import { constantFetchOptions } from './_constant-fetch-options';

export async function cloneCentralToDev(item: {
  orgId: string;
  projectId: string;
  devRepoId: string;
  orgPath: string;
}) {
  let { orgId, projectId, devRepoId, orgPath } = item;

  let projectDir = `${orgPath}/${orgId}/${projectId}`;

  let dirCentral = `${projectDir}/${constants.CENTRAL_REPO_ID}`;
  let dirDev = `${projectDir}/${devRepoId}`;

  let cloneOptions = { fetchOpts: constantFetchOptions };

  await nodegit.Clone.clone(dirCentral, dirDev, cloneOptions);
}
