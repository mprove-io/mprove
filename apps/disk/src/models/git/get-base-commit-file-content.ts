import * as nodegit from 'nodegit';
import { common } from '~disk/barrels/common';

export async function getBaseCommitFileContent(item: {
  repoDir: string;
  filePathRelative: string;
}): Promise<string> {
  let originalContent = '';

  let gitRepo: nodegit.Repository = await nodegit.Repository.open(item.repoDir);

  let currentBranchRef = await gitRepo.getCurrentBranch();
  let currentBranchName = await nodegit.Branch.name(currentBranchRef);

  let head: nodegit.Commit = await gitRepo.getHeadCommit();
  let headOid = head.id();

  let ref = await nodegit.Branch.lookup(
    gitRepo,
    `origin/${currentBranchName}`,
    nodegit.Branch.BRANCH.REMOTE
  ).catch(e => {
    if (e?.message?.includes('cannot locate remote-tracking branch')) {
      return false;
    } else {
      throw e;
    }
  });

  if (common.isDefined(ref) && !!ref) {
    let theirCommit: nodegit.Commit = await gitRepo.getReferenceCommit(
      `refs/remotes/origin/${currentBranchName}`
    );

    if (common.isDefined(theirCommit)) {
      let theirCommitOid = theirCommit.id();

      let commonAncestorOid: nodegit.Oid = await nodegit.Merge.base(
        gitRepo,
        headOid,
        theirCommitOid
      );

      let baseCommit = await gitRepo.getCommit(commonAncestorOid);

      let baseTree: nodegit.Tree = await baseCommit.getTree();

      let baseTreeEntry: nodegit.TreeEntry = await baseTree.getEntry(
        item.filePathRelative
      );

      let baseTreeEntryBlob = await baseTreeEntry.getBlob();

      originalContent = baseTreeEntryBlob.toString();
    }
  }

  return originalContent;
}
