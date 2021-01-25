import { api } from '~/barrels/api';
import * as nodegit from 'nodegit';
import { constantFetchOptions } from './_constant-fetch-options';

export async function deleteRemoteBranch(item: {
  projectDir: string;
  branch: string;
}) {
  let repoDir = `${item.projectDir}/${api.PROD_REPO_ID}`;

  let gitRepo = <nodegit.Repository>await nodegit.Repository.open(repoDir);

  let originRemote = <nodegit.Remote>await gitRepo.getRemote('origin');

  await originRemote.push([`:refs/heads/${item.branch}`], constantFetchOptions);
}
