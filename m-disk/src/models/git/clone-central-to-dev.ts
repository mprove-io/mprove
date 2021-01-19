import * as nodegit from 'nodegit';
import { constants } from '../../barrels/constants';
import { constantFetchOptions } from './_constant-fetch-options';

export async function cloneCentralToDev(item: {
  organizationId: string;
  projectId: string;
  devRepoId: string;
  orgPath: string;
}) {
  let { organizationId, projectId, devRepoId, orgPath } = item;

  let projectDir = `${orgPath}/${organizationId}/${projectId}`;

  let dirCentral = `${projectDir}/${constants.CENTRAL_REPO_ID}`;
  let dirDev = `${projectDir}/${devRepoId}`;

  let cloneOptions = { fetchOpts: constantFetchOptions };

  await nodegit.Clone.clone(dirCentral, dirDev, cloneOptions);
}
