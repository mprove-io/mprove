import * as nodegit from 'nodegit';

export async function mergeCommitsOriginToLocal(item: {
  projectId: string;
  repoDir: string;
  userAlias: string;
  branch: string;
}) {
  let gitRepo = <nodegit.Repository>await nodegit.Repository.open(item.repoDir);

  let remoteRef = <nodegit.Reference>(
    await gitRepo.getReference(`refs/remotes/origin/${item.branch}`)
  );

  let ourCommit = <nodegit.Commit>(
    await gitRepo.getReferenceCommit(`refs/heads/${item.branch}`)
  );

  let theirCommit = <nodegit.Commit>(
    await gitRepo.getReferenceCommit(`refs/remotes/origin/${item.branch}`)
  );

  let theirAnnotatedCommit = <nodegit.AnnotatedCommit>(
    await nodegit.AnnotatedCommit.fromRef(gitRepo, remoteRef)
  );

  await nodegit.Merge.merge(gitRepo, theirAnnotatedCommit, null, {
    checkoutStrategy: nodegit.Checkout.STRATEGY.FORCE
  });

  let index = <nodegit.Index>await gitRepo.refreshIndex();

  if (index.hasConflicts()) {
    // merge contains conflicting changes

    await index.addAll(null, null);

    await (<any>index.write()); // wrong @types - method is async

    await index.writeTree();
  } else {
    // merge is clean
  }

  let oid = <nodegit.Oid>await index.writeTreeTo(gitRepo);

  let author = nodegit.Signature.now(item.userAlias, `${item.userAlias}@`);
  let committer = nodegit.Signature.now(item.userAlias, `${item.userAlias}@`);

  let commitOid = <nodegit.Oid>(
    await gitRepo.createCommit('HEAD', author, committer, 'message', oid, [
      ourCommit,
      theirCommit
    ])
  );

  let commit = <nodegit.Commit>await gitRepo.getCommit(commitOid);

  await nodegit.Reset.reset(gitRepo, commit, nodegit.Reset.TYPE.HARD, null);
}
