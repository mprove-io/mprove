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
    if (e?.message?.includes(common.NODEGIT_REMOTE_BRANCH_NOT_FOUND)) {
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

      let tree: nodegit.Tree = await baseCommit.getTree();

      let entry: nodegit.TreeEntry = await tree
        .getEntry(item.filePathRelative)
        .catch(e => {
          if (e?.message?.includes(common.NODEGIT_PATH_NOT_EXIST_IN_TREE)) {
            return undefined;
          } else {
            throw e;
          }
        });

      if (common.isDefined(entry) && entry.isBlob()) {
        let blob: nodegit.Blob = await entry.getBlob();

        originalContent = blob.toString();
      }
    }
  }

  return originalContent;
}
