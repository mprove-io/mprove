import * as nodegit from 'nodegit';
import { constantFetchOptions } from './_constant-fetch-options';

export async function mergeBranchesOriginToLocal(item: {
  repoDir: string;
  userAlias: string;
  branch: string;
}) {
  let gitRepo = <nodegit.Repository>await nodegit.Repository.open(item.repoDir);

  await gitRepo.fetch('origin', constantFetchOptions);

  let signature = nodegit.Signature.now(item.userAlias, `${item.userAlias}@`);

  await gitRepo.mergeBranches(
    item.branch,
    `origin/${item.branch}`,
    signature,
    nodegit.Merge.PREFERENCE.NONE
  );
}
