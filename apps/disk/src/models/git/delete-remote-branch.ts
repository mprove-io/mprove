import * as nodegit from 'nodegit';
import { common } from '~disk/barrels/common';
import { constantFetchOptions } from './_constant-fetch-options';

export async function deleteRemoteBranch(item: {
  projectDir: string;
  branch: string;
}) {
  let repoDir = `${item.projectDir}/${common.PROD_REPO_ID}`;

  let gitRepo = <nodegit.Repository>await nodegit.Repository.open(repoDir);

  let originRemote = <nodegit.Remote>await gitRepo.getRemote('origin');

  await originRemote.push([`:refs/heads/${item.branch}`], constantFetchOptions);
}
