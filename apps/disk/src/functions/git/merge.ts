import * as nodegit from 'nodegit';
import { addTraceSpan } from '#node-common/functions/add-trace-span';

export async function merge(item: {
  projectId: string;
  projectDir: string;
  repoId: string;
  repoDir: string;
  userAlias: string;
  branch: string;
  theirBranch: string;
  isTheirBranchRemote: boolean;
  fetchOptions: nodegit.FetchOptions;
}) {
  return await addTraceSpan({
    spanName: 'disk.git.merge',
    fn: async () => {
      let gitRepo = <nodegit.Repository>(
        await nodegit.Repository.open(item.repoDir)
      );

      await addTraceSpan({
        spanName: 'disk.git.merge.gitRepo.fetch',
        fn: () => gitRepo.fetch('origin', item.fetchOptions)
      });

      // try fast forward

      let signature = nodegit.Signature.now(
        item.userAlias,
        `${item.userAlias}@`
      );
      await gitRepo.mergeBranches(
        item.branch,
        item.theirBranch,
        signature,
        nodegit.Merge.PREFERENCE.FASTFORWARD_ONLY
      );

      let ourCommit = <nodegit.Commit>(
        await gitRepo.getReferenceCommit(`refs/heads/${item.branch}`)
      );

      let ourCommitOid = ourCommit.id();
      let ourCommitId = ourCommitOid.tostrS();

      let theirStr =
        item.isTheirBranchRemote === true
          ? `refs/remotes/${item.theirBranch}`
          : `refs/heads/${item.theirBranch}`;

      let theirCommit = <nodegit.Commit>(
        await gitRepo.getReferenceCommit(theirStr)
      );
      let theirCommitOid = theirCommit.id();
      let theirCommitId = theirCommitOid.tostrS();

      if (ourCommitId === theirCommitId) {
        return;
      }

      // force

      let theirRef = <nodegit.Reference>await gitRepo.getReference(theirStr);

      let theirAnnotatedCommit = <nodegit.AnnotatedCommit>(
        await nodegit.AnnotatedCommit.fromRef(gitRepo, theirRef)
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
      let committer = nodegit.Signature.now(
        item.userAlias,
        `${item.userAlias}@`
      );

      let message = `Merged branch ${item.theirBranch} to ${item.branch}`;

      let commitOid = <nodegit.Oid>(
        await gitRepo.createCommit('HEAD', author, committer, message, oid, [
          ourCommit,
          theirCommit
        ])
      );

      let commit = <nodegit.Commit>await gitRepo.getCommit(commitOid);

      await nodegit.Reset.reset(gitRepo, commit, nodegit.Reset.TYPE.HARD, null);
    }
  });
}
