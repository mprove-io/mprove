import * as nodegit from '@figma/nodegit';

export async function revertRepoToRemote(item: {
  repoDir: string;
  remoteBranch: string;
}) {
  let gitRepo = <nodegit.Repository>await nodegit.Repository.open(item.repoDir);

  let theirCommit: nodegit.Commit = await gitRepo.getReferenceCommit(
    `refs/remotes/origin/${item.remoteBranch}`
  );

  await nodegit.Reset.reset(
    gitRepo,
    theirCommit,
    nodegit.Reset.TYPE.HARD,
    null
  );
}
