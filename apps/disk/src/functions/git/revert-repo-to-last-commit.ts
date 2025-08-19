import * as nodegit from '@figma/nodegit';

export async function revertRepoToLastCommit(item: { repoDir: string }) {
  let gitRepo: nodegit.Repository = await nodegit.Repository.open(item.repoDir);

  let headCommit: nodegit.Commit = await gitRepo.getHeadCommit();

  await nodegit.Reset.reset(gitRepo, headCommit, nodegit.Reset.TYPE.HARD, null);
}
