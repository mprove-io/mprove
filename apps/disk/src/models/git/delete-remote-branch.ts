import * as nodegit from '@figma/nodegit';
import { common } from '~disk/barrels/common';

export async function deleteRemoteBranch(item: {
  projectDir: string;
  branch: string;
  fetchOptions: nodegit.FetchOptions;
}) {
  let repoDir = `${item.projectDir}/${common.PROD_REPO_ID}`;

  let gitRepo = <nodegit.Repository>await nodegit.Repository.open(repoDir);

  let originRemote = <nodegit.Remote>await gitRepo.getRemote('origin');

  await originRemote.push([`:refs/heads/${item.branch}`], item.fetchOptions);
}
