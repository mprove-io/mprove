import * as nodegit from 'nodegit';
import { constants } from '../../barrels/constants';
import { constantFetchOptions } from './_constant-fetch-options';

export async function cloneCentralToDev(item: {
  organizationId: string;
  projectId: string;
  devRepoId: string;
}) {
  let projectDir = `${constants.ORGANIZATIONS_PATH}/${item.organizationId}/${item.projectId}`;

  let dirCentral = `${projectDir}/${constants.CENTRAL_REPO_ID}`;
  let dirDev = `${projectDir}/${item.devRepoId}`;

  let cloneOptions = { fetchOpts: constantFetchOptions };

  await nodegit.Clone.clone(dirCentral, dirDev, cloneOptions);
}
